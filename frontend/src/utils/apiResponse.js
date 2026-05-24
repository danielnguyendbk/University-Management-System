export function unwrapApiResponse(response) {
  const payload = response?.data ?? response;

  if (payload && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data;
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, "result")) {
    return payload.result;
  }

  return payload;
}

export function unwrapApiList(response) {
  const data = unwrapApiResponse(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}
