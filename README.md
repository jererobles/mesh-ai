# The New ~Bing~ Everything

A simple implementation of the ChatGPT API in an attempt to replicate the "new Bing" in an open source and (hopefully) extensible way.

Read the [blogpost here](https://blog.jererobles.me/b/6F9D6A3A-A8A7-4E47-8CDB-1FFD0C3A1D85/The-new-everything).

![Logo generated by DALL-E](https://user-images.githubusercontent.com/9132875/222984572-9630ebb7-aa22-4567-9345-8d789319be24.png)

Artwork by Dall-E with prompt `AI-powered search engine, abstract`

## Demo

https://user-images.githubusercontent.com/9132875/222984291-b5baa390-158f-4770-ae57-7d80b7f49df5.mp4

## Example interaction

Prompt

```
what is latest tesla stock price?
```

Answer

```
✅ Topic: Financial market trends and updates.
🔍 Searching the web for: Tesla stock price.
🔗 Found 10 sources
📖 Reading...
🤓 Summarizing...
💬 As of the close of trading on March 8th, 2023, Tesla Inc's (TSLA) stock price was 177.91 USD [1], which represents a decrease of -4.09 (-2.25%) from the previous trading day's close. The 52-week range for the stock is 101.81 - 384384.29 USD USD. The market capitalization of Tesla Inc is 575.867B USD, with 3.16B shares outstanding. The YTD % change for the stock is 47.75%. The P/E (TTM) ratio for the stock is 50.21, and the Fwd P/E (NTM) ratio is 45.91.. The EPS (TTM) for the stock is 3.62.

📚 Sources used:
 1. https://www.cnbc.com/quotes/TSLA
```

## Usage

Set your OpenAI API Key in `.env`

```bash
git clone https://github.com/jererobles/mesh-ai.git
cd mesh-ai
echo "<your_key>" > .env
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun index.ts
```

## How it works

This section is a WIP.

### Agent

Just like no single human has the knowledge or is trained to do every task, it is unreasonable to expect one model with a fixed set of parameters to handle every user input.

An Agent is just an instance of GPT3.5 with a predefined set of parameters and more importantly, a conversation seed that defines the capabilities and personality of the agent. It is also possible, although optional, to pass a `transformer` function and a `validation` function. See [agents/types.ts](https://github.com/jererobles/mesh-ai/blob/main/agents/types.ts) for more information.

### API

Any backend system that the AI may decide to call. We avoid implementing too much website-specific parsing logic as these are prone to break over time — instead we prefer to let the language model make sense of the context by translating it to something more amenable e.g. HTML -> Markdown.

### Model

Representing a model from OpenAI — an API key is required to use it but this may change in the future if we decide to support offline usage. DaVinci and ChatGPT-3.5 are the ones implemented so far but only the latter is actually used.

## Caveats

- code needs more time than I can dedicate in a weekend meaning lots of parts need to be refactored
- although Agents support _some_ limited logic using the functions mentioned above, **the intention is to craft the seed messages in order to produce the desired output** — with the one exception of the "final" response which may contain special keywords injected in the response that the stream parser can pick up on in order to decide if a web search is required
- sometimes the model's limitations leak through for example in the demo video the identified topic refers to a strike that happened in 2021 even though the model correctly identified that it lacked recent enough data to reply and therefore chose to do a web search — which correctly provided information about the ongoing strike in 2023
- as of now the single starting point for every query the Agent does not know an answer to is a search engine – this is fine in 90%+ of the cases but imagine what it would look like if the Agent(s) could decide where to start looking from and (iteratively) find better answers to the prompt, eg. by making further search queries or following links (whatever happened to sitemaps?)

## To Do

- [x] initial PoC
- [x] silly blog post
- refactor
  - [ ] nested Promises
  - [ ] unhandled empty responses (due to exceeded token length, network failure, etc.)
- features
  - [x] cite references
  - [ ] automatically trim history/prompts to fit token length
  - [ ] support more search engines such as DDG
  - [ ] image and video search
  - [ ] define more Agents
    - [ ] map Agents to topics to answer in different voices or further refine results
    - [ ] centralized service to create and 'train' own agents

---

This project was created using `bun init` in bun v0.5.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
