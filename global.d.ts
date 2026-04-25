/// <reference types="mdx" />

declare module '*.glsl' {
  const value: string
  export default value
}

declare module 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime' {
  export { Fragment, jsx, jsxs } from 'react/jsx-runtime'
}

declare module 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime' {
  export { Fragment, jsxDEV } from 'react/jsx-dev-runtime'
}
