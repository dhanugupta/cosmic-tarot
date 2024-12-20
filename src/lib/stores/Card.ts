export class Card {
  name: string;
  image: string;
  type: string;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  name_short: string;
  reversed: boolean;

  constructor(
    name: string,
    image: string,
    type: string,
    meaning_up: string,
    meaning_rev: string,
    desc: string,
    name_short: string,
    reversed: boolean,
  ) {
    this.name = name;
    this.image = image;
    this.type = type;
    this.meaning_up = meaning_up;
    this.meaning_rev = meaning_rev;
    this.desc = desc;
    this.name_short = name_short;
    this.reversed = reversed;
  }
}
