import { Fetcher } from ".";

export const GetCollectionAPI = (params?: string) => {
  const option = {
    method: "GET",
  };

  return Fetcher(
    `${process.env.NEXT_PUBLIC_PWA_HOST}/collections${params ?? ""}`,
    option,
  );
};

export const PostCollectionAPI = (input: {
  body: any;
  params?: string | undefined;
}) => {
  const option = {
    method: "POST",

    body: JSON.stringify(input.body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return Fetcher(
    `${process.env.NEXT_PUBLIC_PWA_HOST}/collections${input?.params ?? ""}`,
    option,
  );
};
export const PutCollectionAPI = (input: {
  body: any;
  params?: string | undefined;
}) => {
  const option = {
    method: "PUT",

    body: JSON.stringify(input.body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return Fetcher(
    `${process.env.NEXT_PUBLIC_PWA_HOST}/collections${input?.params ?? ""}`,
    option,
  );
};
