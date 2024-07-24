import './index.css'

import { useEffect, useRef, useState, Component } from 'react'
import { createOutfitPreview } from '@aagam/tailor'
import { hashCode } from '../common/utils.ts'

import type { FC } from 'react'
import type {
  TailorOutfitPreview as Tailor,
  TOutfitConfig,
  TPreviewOptions,
  TTextureConfig,
} from '@aagam/tailor'

//------------------------------------------------------------------------------
//-----------------------------------<  Types  >--------------------------------
//------------------------------------------------------------------------------

export type TTextureMap = Record<string, TTextureConfig | null>
export interface TailorOutfitPreviewProps {
  outfitCfg: TOutfitConfig
  width: string
  height: string
  options?: TPreviewOptions
  textures?: TTextureMap
  loader?: Component
  error?: Component
}

type TArchivedTextureMap = Record<string, number>

type TTextureMapDiff = Record<string, DiffType>

type TJob = Record<
  string,
  | {
      type: TJobType.APPLY
      data: TTextureConfig
    }
  | {
      type: TJobType.REMOVE
    }
>

//------------------------------------------------------------------------------
//---------------------------------<  Constants  >------------------------------
//------------------------------------------------------------------------------

const JOB_QUEUE_LENGTH = 2

enum DiffType {
  CREATED,
  MODIFIED,
  DELETED,
}

enum TJobType {
  APPLY,
  REMOVE,
}

//------------------------------------------------------------------------------
//---------------------------------<  Components  >-----------------------------
//------------------------------------------------------------------------------

export const TailorOutfitPreview: FC<TailorOutfitPreviewProps> = ({
  width = '100%',
  height = '100%',
  ...props
}) => {
  const containerRef = useRef(null)
  const appliedTextures = useRef<TArchivedTextureMap>({})

  const [tailor, setTailor] = useState<Tailor | null>(null)
  const [jobQueue, setJobQueue] = useState<TJob[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errs, setErrs] = useState<string[]>([])

  //================================<  Side effects  >============================

  // On mount, create tailor instance
  // When outfitCfg changes, rebuild tailor instance
  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        // If tailor instance already exists, destroy it
        if (tailor) {
          // TODO: destroy tailor instance here
        }

        // Create tailor instance
        const rootEl = containerRef.current as HTMLElement
        const _tailor = await createOutfitPreview(props.outfitCfg, rootEl)
        setTailor(_tailor)
      } catch (e) {
        setErrs(errs => [...errs, e.message])
      }
      setLoading(false)
    }

    init()
  }, [props.outfitCfg])

  // When preview options are changed
  useEffect(() => {
    if (tailor && props.options) tailor.setPreviewOptions(props.options)
  }, [tailor, props.options])

  // When texture map changes
  useEffect(() => {
    if (!(tailor && props.textures)) return

    const newTextures = archiveTextureMap(props.textures)
    const diff = diffArchivedTextureMaps(newTextures, appliedTextures.current)
    appliedTextures.current = newTextures

    const job: TJob = {}
    for (let groupKey in diff) {
      const diffType = diff[groupKey]
      if (diffType === DiffType.CREATED || diffType === DiffType.MODIFIED) {
        job[groupKey] = {
          type: TJobType.APPLY,
          data: props.textures![groupKey]!,
        }
      } else {
        job[groupKey] = {
          type: TJobType.REMOVE,
        }
      }
    }

    setJobQueue(q => {
      const nq = [...q]
      if (nq.length === JOB_QUEUE_LENGTH) nq[length - 1] = job
      else nq.push(job)
      return nq
    })
  }, [tailor, props.textures])

  // When job queue changes
  useEffect(() => {
    async function processJobQueue() {
      if (!tailor) {
        // scheduleJobProcessing()
        return
      }

      if (jobQueue.length === 0) return

      if (jobQueue.length > 0 && !loading) {
        setLoading(true)
        setJobQueue(jobQueue.slice(1))

        const job = jobQueue[0]
        const results = await Promise.allSettled(
          Object.entries(job).map(async ([groupKey, groupJob]) => {
            if (groupJob.type === TJobType.APPLY)
              await tailor.applyTextureOnGroup(groupKey, groupJob.data)
            else await tailor.removeTextureOnGroup(groupKey)
          })
        )
        const errs: string[] = []
        for (let result of results) {
          if (result.status === 'rejected') errs.push(result.reason)
        }
        setErrs(_errs => [..._errs, ...errs])
        setLoading(false)
      }
    }

    processJobQueue()
  }, [jobQueue.length, loading])

  //===============================<  Render method  >============================

  const Loader = props.loader ?? TailorLoader
  const Error = props.error ?? TailorError

  return (
    <div
      className="tailor-container"
      style={{
        width,
        height,
      }}
      ref={containerRef}
    >
      <div
        className="tailor-error-container tailor-overlay"
        style={{
          opacity: errs.length > 0 ? 1 : 0,
        }}
      >
        {errs.length > 0 && <Error msgs={errs} />}
      </div>
      <div
        className="tailor-loader-container tailor-overlay"
        style={{
          opacity: loading ? 1 : 0,
        }}
      >
        {loading && <Loader />}
      </div>
    </div>
  )
}

//==============================<  Loader component  >==========================

const TailorLoader: FC = _ => {
  return <span className="tailor-loader">Loading</span>
}

//==============================<  Error component  >===========================

interface TailorErrorProps {
  msgs: string[]
}

const TailorError: FC<TailorErrorProps> = props => {
  return (
    <div className="tailor-error">
      {props.msgs.map((msg, i) => (
        <p key={i} className="tailor-error-item">
          {msg}
        </p>
      ))}
    </div>
  )
}

//------------------------------------------------------------------------------
//-----------------------------------<  Utils  >--------------------------------
//------------------------------------------------------------------------------

function archiveTextureMap(map: TTextureMap): TArchivedTextureMap {
  const archivedMap: TArchivedTextureMap = {}
  for (let key in map) {
    const { imgSrc, ...rest } = map[key]!
    archivedMap[key] = hashCode(`${hashCode(imgSrc)}_${JSON.stringify(rest)}`)
  }
  return archivedMap
}

function diffArchivedTextureMaps(
  newMap: TArchivedTextureMap,
  baseMap: TArchivedTextureMap
): TTextureMapDiff {
  const diff: TTextureMapDiff = {}
  for (let key in newMap) {
    if (!baseMap[key]) {
      diff[key] = DiffType.CREATED
    } else if (newMap[key] !== baseMap[key]) {
      diff[key] = DiffType.MODIFIED
    }
  }
  for (let key in baseMap) {
    if (!diff.hasOwnProperty(key) && !newMap[key]) diff[key] = DiffType.DELETED
  }
  return diff
}
