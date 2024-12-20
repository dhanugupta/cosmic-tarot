<script lang="ts">
  export let imageSrc: string;
  export let name: string | undefined;
  export let description: string | undefined;
  export let cardLabel: string;
  export let reversed: boolean = false;
</script>

<div class="card-wrapper">
  <div class="card">
    <img
      class={reversed ? "reversed" : ""}
      src={imageSrc}
      alt={name ? name : ""}
    />
  </div>
  {#if name}
    <div class="card-name"><h3>{name}</h3></div>
  {/if}
  {#if description}
    <div class="card-desc"><p>{description}</p></div>
  {/if}
  {#if cardLabel}
    <div class="card-footer">{cardLabel}</div>
  {/if}
</div>

<style>
  .card-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px;
    width: 200px;
  }

  .card {
    width: 200px;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
    cursor: pointer;
    transition: transform 0.3s ease;
    position: relative;
  }

  .card img {
    width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .card:hover {
    transform: scale(1.05);
  }

  .card-name h3 {
    margin: 10px 0;
    font-size: 18px;
    color: #007bff;
  }

  .card-desc p {
    font-size: 14px;
    color: #555;
  }

  .card-footer {
    margin-top: 40px;
    font-size: large;
    font-weight: 600;
  }

  .reversed {
    transform: rotate(180deg);
  }
</style>
