import { CardInterpretation } from "./CardInterpretation";

export class ResponseData {
  greeting: string;
  summary: string;
  past: CardInterpretation;
  present: CardInterpretation;
  future: CardInterpretation;
  combined_meaning: string;
  closing_message: string;

  constructor(
    greeting: string,
    summary: string,
    past: CardInterpretation,
    present: CardInterpretation,
    future: CardInterpretation,
    combined_meaning: string,
    closing_message: string,
  ) {
    this.greeting = greeting;
    this.summary = summary;
    this.past = past;
    this.present = present;
    this.future = future;
    this.combined_meaning = combined_meaning;
    this.closing_message = closing_message;
  }
}
