export function mockName(str: string, mockPrefix: string = "mock") {
  return mockPrefix + capitalizeFirst(str);
}

function capitalizeFirst(str: string) {
  return str.replace(/^\w/, (match) => match.toUpperCase());
}
