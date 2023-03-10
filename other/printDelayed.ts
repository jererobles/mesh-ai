// FIXME: its hard to follow the JS execution logic with so many callbacks and timeouts and async functions

// to simulate the AI typing, we need to print each chunk of the response with a slight delay
export const printDelayed = (
  text: string,
  chunkNumber: number,
  fn?: () => void
) =>
  setTimeout(() => {
    process.stdout.write(text);
    fn && fn(); // call the callback function if it is provided
  }, chunkNumber * 50);
