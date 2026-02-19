export const Fetcher = (path: string, option: any) => {
  try {
    return fetch(path, option).then(async (response) => {
      try {
        return { status: response.status, result: await response.json() };
      } catch (error: any) {
        return {
          status: response.status,
          result: error?.message || "Failed to parse JSON",
        };
      }
    });
  } catch (error: any) {
    return {
      status: 500,
      result: error?.message || "Failed to connect",
    };
  }
};
