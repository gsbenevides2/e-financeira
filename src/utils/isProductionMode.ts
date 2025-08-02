export const isProductionMode = () => {
  return Bun.env.ENABLE_PRODUCTION_MODE === "true";
};

export const isDevelopmentMode = () => {
  return !isProductionMode();
};
