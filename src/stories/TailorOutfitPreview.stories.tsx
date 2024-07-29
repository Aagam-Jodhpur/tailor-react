import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Controls, Description, Subtitle, Title } from '@storybook/blocks'

import type { TOutfitConfig, TTextureConfig } from '@aagam/tailor'
import { TailorOutfitPreview } from '../components/TailorOutfitPreview'
// import { textures } from './constants'

//------------------------------------------------------------------------------
//-----------------------------------<  Assets  >-------------------------------
//------------------------------------------------------------------------------

//================================<  Base images  >=============================

import base from './assets/kurta-pyjama/base.png'
import enhancedBase from './assets/kurta-pyjama/enhanced-base.png'

//================================<  Mask images  >=============================

import centerPattiMask from './assets/kurta-pyjama/kurta/masks/kurta collar and center patti mask.png'
import armsMask from './assets/kurta-pyjama/kurta/masks/kurta pyajama arm mask.png'
import cuffsMask from './assets/kurta-pyjama/kurta/masks/kurta pyajama cuffs mask.png'
import centerBodyMask from './assets/kurta-pyjama/kurta/masks/Kurta vest mask.png'
import fullPyjamaMask from './assets/kurta-pyjama/pyjama/masks/full-mask.png'

//==================================<  Textures  >==============================

import texture1 from './assets/textures/1.jpg'
// import texture2 from './assets/textures/4.jpg'
// import texture3 from './assets/textures/5.jpg'
import texture4 from './assets/textures/6.jpg'

//------------------------------------------------------------------------------
//------------------------------------<  Meta  >--------------------------------
//------------------------------------------------------------------------------

const meta = {
  title: 'Example/TailorOutfitPreview',
  component: TailorOutfitPreview,
  parameters: {
    layout: 'centered',
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Controls />
        </>
      ),
    },
  },
  // tags: ['autodocs'],
  argTypes: {
    outfitCfg: {
      table: {
        category: 'Main',
      },
    },
    textures: {
      table: {
        category: 'Main',
      },
    },
    options: {
      table: {
        category: 'Main',
      },
    },
    width: {
      table: {
        category: 'Appearanace',
      },
    },
    height: {
      table: {
        category: 'Appearanace',
      },
    },
    noLoader: {
      table: {
        category: 'Appearanace',
      },
    },
    noErrorDisplay: {
      table: {
        category: 'Appearanace',
      },
    },
    onInitStart: {
      table: {
        category: 'Event handlers',
      },
    },
    onInitEnd: {
      table: {
        category: 'Event handlers',
      },
    },
    onRenderStart: {
      table: {
        category: 'Event handlers',
      },
    },
    onRenderEnd: {
      table: {
        category: 'Event handlers',
      },
    },
    onError: {
      table: {
        category: 'Event handlers',
      },
    },
    loader: {
      control: {
        disable: true,
      },
      table: {
        category: 'Render props',
        defaultValue: {
          summary: 'TailorLoader',
          detail: 'Internal component',
        },
      },
    },
    error: {
      control: {
        disable: true,
      },
      table: {
        category: 'Render props',
        defaultValue: {
          summary: 'TailorError',
          detail: 'Internal component',
        },
      },
    },
  },
  args: {
    width: '400px',
    height: '600px',
    onInitStart: fn(),
    onInitEnd: fn(),
    onRenderStart: fn(),
    onRenderEnd: fn(),
    onError: fn(),
  },
} satisfies Meta<typeof TailorOutfitPreview>

export default meta

type Story = StoryObj<typeof meta>

//------------------------------------------------------------------------------
//-----------------------------------<  Config  >-------------------------------
//------------------------------------------------------------------------------

const kurtaPyjamaOutfitCfg: TOutfitConfig = {
  base: {
    width: 4000,
    height: 6000,
    imgSrc: base,
    enhancedImgSrc: enhancedBase,
  },
  groupWiseLayers: {
    kurta: [
      {
        maskImgSrc: cuffsMask,
      },
      {
        maskImgSrc: armsMask,
      },
      {
        maskImgSrc: centerPattiMask,
      },
      {
        maskImgSrc: centerBodyMask,
      },
    ],
    pyjama: [
      {
        maskImgSrc: fullPyjamaMask,
      },
    ],
  },
}

const textureMap: Record<string, TTextureConfig> = {
  kurta: {
    // imgSrc: textures.top,
    imgSrc: texture1,
  },
  pyjama: {
    imgSrc: texture4,
    // imgSrc: textures.bottom,
  },
}

//------------------------------------------------------------------------------
//----------------------------------<  Stories  >-------------------------------
//------------------------------------------------------------------------------

export const BaseOnly: Story = {
  args: {
    outfitCfg: kurtaPyjamaOutfitCfg,
  },
}

export const BaseWithTexture: Story = {
  args: {
    outfitCfg: kurtaPyjamaOutfitCfg,
    textures: textureMap,
  },
}
