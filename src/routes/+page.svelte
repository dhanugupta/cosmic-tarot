<script lang="ts">
  // load cards data from data/tarot-cards.json object
  import { onMount, setContext } from "svelte";
  import type { Card } from "../lib/stores/Card.ts";
  import type { ResponseData } from "../lib/stores/ResponseData.ts";
  import { writable, get } from "svelte/store";
  import TarotCard from "../lib/components/TarotCard.svelte";
  import "../css/globals.css";
  import "../css/tarot.css";

  export let cards: Card[] = [];
  let displaySelectedCards = writable(false);
  let responseReading = writable<ResponseData | null>(null);
  let currentReadingType = writable("");
  let userName = writable("");
  let currentMood = writable("");
  const moodDescriptions: { [key: number]: string } = {
    1: "Joyful",
    2: "Calm",
    3: "Anxious",
    4: "Motivated",
    5: "Melancholy",
    6: "Irritated",
    7: "Unspecified Feelings",
  };

  function handleInputChange() {
    userName.subscribe((value) => {});
  }

  function handleMoodChange() {
    currentMood.subscribe((value) => {
      console.log("Current mood:", value);
    });
  }

  let currentContext = writable("");

  function handleContextChange() {
    currentContext.subscribe((value) => {
      console.log("Current Context:", value);
    });
  }

  onMount(async () => {
    try {
      const response = await fetch("/data/tarot-cards.json");
      if (!response.ok) {
        throw new Error("Failed to fetch tarot cards");
      }
      cards = await response.json();
    } catch (error) {
      console.error("Error loading tarot cards:", error);
    }
  });

  let deck = [...cards];
  let past: Card, present: Card, future: Card;

  function validateForm() {
    const userNameValue = get(userName);
    const currentMoodValue = get(currentMood);
    const currentContextValue = get(currentContext);

    if (!userNameValue || !currentMoodValue || !currentContextValue) {
      alert("Please fill in all required fields.");
      return false;
    }
    return true;
  }

  function drawCards() {
    if (!validateForm()) return false;
    deck = [...cards]; // Reset the deck
    past = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    present = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    future = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    past = { ...past, reversed: Math.random() < 0.5 };
    present = { ...present, reversed: Math.random() < 0.5 };
    future = { ...future, reversed: Math.random() < 0.5 };

    const cardsTmp = document.querySelectorAll(".card");

    cardsTmp.forEach((card) => {
      card.classList.add("rotate");
    });
    setTimeout(() => {
      cardsTmp.forEach((card) => {
        card.classList.remove("rotate");
      });
      //animate the tarot deck with mouse over effect
      // Display the selected cards: past, present, future
      displaySelectedCards.set(true);
    }, 1800);
  }

  const generateAIReading = async () => {
    const mood = moodDescriptions[Number(get(currentMood))] || "Undefined";
    const readingType = Number(get(currentReadingType));
    const name = get(userName);
    const context = get(currentContext);
    const pastCard = past.name + (past.reversed ? " (Reversed)" : "");
    const presentCard = present.name + (present.reversed ? " (Reversed)" : "");
    const futureCard = future.name + (future.reversed ? " (Reversed)" : "");
    // Display the AI reading
    const prompt = {
      past: `${pastCard}`,
      present: `${presentCard}`,
      future: `${futureCard}`,
      userName: `${name}`,
      currentMood: `${mood}`,
      currentContext: `${context}`,
      currentReadingType: `${get(currentReadingType)}`,
    };
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const responseData = await response.json();
      const formatted = responseData.text.replace(/\n/g, "");
      responseReading.set(JSON.parse(formatted));
    } catch (error) {
      console.error("Error fetching AI reading:", error);
    }
  };
</script>

<div class="app-container">
  <h2>Cosmic Tarot reading by AI</h2>
  <p>
    Tarot cards are <b>NOT*</b> designed to predict the future with certainty.
  </p>
  <p>
    Instead, they serve as tools for <strong>introspection</strong>,
    <strong>guidance</strong>, and <strong>self-discovery</strong>.
  </p>
  <p>
    Through their symbolic imagery, tarot cards can provide insights into
    current situations, highlight potential paths, and help uncover underlying
    patterns or emotions.
  </p>
  <p>
    The focus is on offering clarity and perspective rather than fixed
    predictions.
  </p>
  <div class="input-wrapper">
    <div class="user-info">
      <input
        type="text"
        class="user-input {userName ? '' : 'required-field'}"
        placeholder="Enter your name"
        bind:value={$userName}
        on:input={handleInputChange}
        title="Any name you self-identify with"
        required
      />
      <select
        class="user-input"
        bind:value={$currentMood}
        on:change={handleMoodChange}
        required
      >
        <option value="" disabled selected>Your current mood</option>
        <option value="1">Joyful</option>
        <option value="2">Calm</option>
        <option value="3">Anxious</option>
        <option value="4">Motivated</option>
        <option value="5">Melancholy</option>
        <option value="6">Irritated</option>
        <option value="7">Other</option>
      </select>
    </div>

    <textarea
      class="prompt-input"
      placeholder="Share the details of your situation to receive deeper insights and guidance.."
      rows="2"
      bind:value={$currentContext}
      on:change={handleContextChange}
      required
    />
    <button class="button-design" on:click={drawCards}>
      Draw Cards (Remember to focus your mind on your question!)
    </button>
  </div>
  <div class="card-container">
    {#if $displaySelectedCards}
      <div class="selected-cards fade-in">
        <TarotCard
          imageSrc={"/images/tarot-cards/" + past.name_short + ".jpg"}
          name={past.name}
          description={past.meaning_up}
          cardLabel="Past"
          reversed={past.reversed}
        />
        <TarotCard
          imageSrc={"/images/tarot-cards/" + present.name_short + ".jpg"}
          name={present.name}
          description={present.meaning_up}
          cardLabel="Present"
          reversed={present.reversed}
        />
        <TarotCard
          imageSrc={"/images/tarot-cards/" + future.name_short + ".jpg"}
          name={future.name}
          description={future.meaning_up}
          cardLabel="Future"
          reversed={future.reversed}
        />
      </div>
    {:else}
      <TarotCard
        imageSrc={"/images/img.png"}
        name=""
        description=""
        cardLabel="Past"
      />
      <TarotCard
        imageSrc={"/images/img.png"}
        name=""
        description=""
        cardLabel="Present"
      />
      <TarotCard
        imageSrc={"/images/img.png"}
        name=""
        description=""
        cardLabel="Future"
      />
    {/if}

    <button class="button-design" on:click={generateAIReading}>
      AI Reading
    </button>
    {#if $responseReading}
      <div class="ai-reading fade-in">
        <h3>{$responseReading.greeting}</h3>
        <p>{$responseReading.summary}</p>
        <h4>{$responseReading.past.interpretation}</h4>
        <h4>{$responseReading.present.interpretation}</h4>
        <h4>{$responseReading.future.interpretation}</h4>
        <p>{$responseReading.combined_meaning}</p>
        <p>{$responseReading.closing_message}</p>
      </div>
    {/if}
  </div>
</div>
