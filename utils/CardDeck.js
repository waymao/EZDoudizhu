const available_num = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const available_color = ['S', 'H', 'D', 'C'];
const available_extra = ["Big_Joker", "Small_Joker"];


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


class Card {
    constructor(color, num) {
        this.color = color;
        this.num = num;
    }

    isEqual = card => {
        return card.color === this.color && card.extra === this.extra;
    }
}


class CardDeck {
    constructor(num_decks, include_joker) {
        this.deck = [];
        for (let i = 0; i < num_decks; i++) {
            for (let one_num of available_num) {
                for (let one_color of available_color) {
                    this.deck.push(new Card(one_color, one_num));
                }
            }
            if (include_joker === true) {
                for (let joker of available_extra) {
                    this.deck.push(new Card(null, joker));
                }
            }
        }

        this.delete = this.delete.bind(this);
        this.dealCard = this.dealCard.bind(this);
    }

    delete(card) {
        for (let i = 0; i < this.deck.length; i++) {
            if (this.deck[i].isEqual((card))) {
                this.deck.splice(i, 1);
            }
        }
    };

    // returns the result of splitting the deck into n piles equally.
    dealCard (deck_count) {
        // Compute constants
        let new_array = this.deck.slice();
        const deck_length = new_array.length;
        const card_per_deck = Math.round(deck_length / deck_count);

        // shuffle and split
        shuffleArray(new_array);
        let new_deck_list = [];
        for (let card_ct = 0; card_ct < deck_length; card_ct += card_per_deck) {
            new_deck_list.push(new_array.slice(card_ct, card_ct + card_per_deck));
        }

        return new_deck_list;
    }
}
