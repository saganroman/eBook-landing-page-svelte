<script>
    import {loadStripe} from "@stripe/stripe-js";
    import {PUBLIC_STRIPE_KEY, PUBLIC_FRONTEND_URL} from "$env/static/public";
    import {goto} from "$app/navigation";

    let {children,onclick, ...props} = $props();

    async function onButtonClick() {
        if(onclick) return onclick();
        const stripe = await loadStripe(PUBLIC_STRIPE_KEY);
        try {
            const response = await fetch(`${PUBLIC_FRONTEND_URL}/api/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const session = await response.json();
            window.location.href = session.url;
        } catch (error) {
            goto('/checkout/failure');
        }
    }
</script>

<button {...props} onclick={onButtonClick}> {@render children()} </button>

<style>
    button {
        background-color: black;
        color: white;
        padding: 20px 24px;
        font-weight: normal;
        font-size: 22px;
        text-transform: uppercase;
        transition: all 0.3s;
        border: 1px solid white;
    }

    button:hover {
        background-color: white;
        color: black;
    }

    .selected-chapter-title {
        background-color: white;
        border: none;
        color: black;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.08);
    }
</style>
