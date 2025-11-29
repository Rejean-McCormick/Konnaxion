// FILE: frontend/.storybook/preview.ts
// .storybook/preview.ts
import '../styles/globals.css'
import type { Preview } from '@storybook/nextjs'
import { RouterContext } from 'next/dist/shared/lib/router-context'

const preview: Preview = {
  parameters: {
    // tell Storybook how to mock Next’s router
    nextRouter: {
      Provider: RouterContext.Provider,
    },
  },
}

export default preview
