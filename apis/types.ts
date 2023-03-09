// promise type holding the full text from the response and another promise that resolves when the response is done printing

export type GptResponse = {
  /**
   * metadata passed to the request, used to identify the response across multiple parallel requests
   */
  metadata: string | undefined;

  /**
   * full text from the response
   */
  text: string;

  /**
   * true if the response was dropped because it was invalid as per the validator
   * @see ../agents/types.ts
   */
  dropped: boolean;

  /**
   * promise that resolves when the response is done printing
   * @see ../other/printDelayed.ts
   */
  doneTyping: Promise<void>;
};
