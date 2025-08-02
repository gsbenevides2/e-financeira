import tw from "@tailwindcss/postcss";

type PluginOptions = Parameters<typeof tw>[0];

export interface ReactBuilderOptions {
  entrypoint: string;
  publicDir: string;
}

export interface TailwindBuilderOptions {
  source: string;
  tailwindConfig?: PluginOptions;
  minify?: boolean;
  map?: boolean;
  autoprefixer?: boolean;
}

export interface FrontendBuilderOptions {
  react: ReactBuilderOptions;
  tailwind: TailwindBuilderOptions;
}
