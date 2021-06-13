//Variabile che imposta il livello di gioco
var level;
//Larghezza e altezza della griglia di gioco
var width, height;

//Richiesta livello di gioco all'utente
while(isNaN(level)){
    level = parseInt(prompt('Inserisci il livello di gioco da 1 a 2'));
}

//In base al livello impostiamo le misure della griglia
switch(level){
    case 1:
        [width, height] = [4,3];
        break;
    case 2:
        [width, height] = [6,6];
        break;   
}

//Difficoltà in base alla larghezza e altezza della griglia
var difficulty = width * height;

//Tempo di gioco in secondi
var timer = difficulty * 3;
var startTimer = false;

//Generiamo il primo mazzo di carte e il secondo mazzo doppione del primo
var [firstDeck, secondDeck] = [generateDeck(difficulty), generateDeck(difficulty)];

//Mazzo completo
var fullDeck = firstDeck.concat(secondDeck);

//Instanziamo le variabili della prima carta girata e della seconda
var firstCard;
var secondCard;

// Posizione della prima carta selezionata
var selectedCard;

//Variabile che gestisce l'attesa del click
var waiting = true;

//Stabiliamo la vittoria
var promiseWin;

//Elementi cliccati delle carte (DOM) che vengono salvate nell'array
var itemsCard = [];

//Path immagine il retro della carta
var pathBackCard = 'img/retro-carta.jpg';

//Stampiamo le carte coperte 
getCard(difficulty, pathBackCard);

//Gestiamo il click di ogni carta
var cards = document.getElementsByClassName('card');

//Iteriamo HTMLCollection con [].forEach.call()
[].forEach.call(cards, setEventCard);

/**
 * Algoritmo che elabora tutta la logica del gioco
 * @param {number} id 
 * @param {string} ele 
 * @param {array} itemsDeck 
 */
function logicGame(id, ele, itemsDeck){
    
    if(waiting){
        //Controlliamo se è stata girata la prima carta o la seconda
        if(firstCard && selectedCard !== id){
            secondCard = itemsDeck[id];
            itemsCard[1] = ele;
            changeOrDeliteCard(ele, null, secondCard);
        }else{
            firstCard = itemsDeck[id];
            selectedCard = id;
            itemsCard[0] = ele;
            changeOrDeliteCard(ele, null, firstCard);
        }
    }

    //Funzione che richiama l'avvio del timer
    getTimer(timer).then(result => statusGame(false));
    
    //Verifichiamo se le due carte girate sono uguali
    if(secondCard && firstCard === secondCard){
        //Se è true eliminiamo i doppioni dall'array itemsDeck
        deliteCardDeck(itemsDeck, secondCard);
        //Eliminiamo il valore delle carte salvtate in precedenza dell'utente
        [firstCard, secondCard] = [null, null];
        waiting = false;

        setTimeout(function(){
            waiting = true;
            //Eliminiamo le carte che sono state indovinate
            changeOrDeliteCard(itemsCard, true);
        },1000);

        //Verifichiamo se l'utente ha vinto
        if(!itemsDeck.length){
            promiseWin = Promise.resolve('win');
        }
        
    }else if(secondCard && firstCard !== secondCard){
        //Eliminiamo il valore delle carte salvtate in precedenza dell'utente
        [firstCard, secondCard] = [null, null];
        waiting = false;

        setTimeout(function(){
            waiting = true;
            //Facciamo ritornare le carte coperte
            changeOrDeliteCard(itemsCard, false);
        },1000);
    }
}

/**
 * Funzione che elabora la schermata della vittoria o sconfitta
 * @param {Boolean} bool
 * @param {number} time 
 */
function statusGame(bool, time){
    //Mostriamo la sezione del risultato della partita
    document.getElementById('game').remove();
    document.getElementById('end-game').className = '';
    var eleMessage = document.getElementById('message');
    var eleScore = document.getElementById('score');
    var btnStart = document.getElementById('start');

    if(bool){
        eleMessage.innerHTML = "Congratulazioni, hai trovato tutte le carte!";
        eleScore.innerHTML = "L'hai completato in " + (difficulty * 3 - time) + ' secondi, mancavano gli ultimi ' + time + ' secondi';
    }else{
        eleMessage.innerHTML = "OPS, non sei riuscito a completarlo...";
        eleScore.innerHTML = "Tempo scaduto!";
    }
    btnStart.addEventListener('click',function(){
        window.location.reload();
    });
}

/**
 * Funzione che gestisce il tempo rimanente del gioco
 */
 function getTimer(time){
    return new Promise((resolve, reject) =>{
        if(!startTimer){
            startTimer = true;
            var interval = setInterval(() =>{
                time--;
                document.getElementById('timer').innerHTML = `Tempo rimanente ${time} secondi`;
                if(!time){
                    //clearInterval(interval);
                    resolve(clearInterval(interval));
                }
                promiseWin?.then(result => {
                    clearInterval(interval);
                    statusGame(true, time)
                });
            },1000);
        }
    });
}


/**
 * Algoritmo che cambia l'immagine alle carte in base al valore booleano 
 * @param {*} eleCard 
 * @param {boolean} bool
 * @param {number} idCard 
 */
function changeOrDeliteCard(eleCard, bool, idCard){
    eleCard.src = 'img/emoji-' + idCard + '.jpg';

    //Se non ha indovinato le carte, le giriamo cambiando l'immagine nell'attributo
    if(bool === false){
        eleCard[0].src = pathBackCard;
        eleCard[1].src = pathBackCard;
        eleCard = [];
    }
    
    //Se ha indovinato le carte, le eliminiamo dal DOM
    if(bool === true){
        eleCard[0].parentNode.removeChild(eleCard[0]);
        eleCard[1].parentNode.removeChild(eleCard[1]);
        eleCard = [];
    }
}

/**
 * Funzione che elimina gli elementi trovati dall'array originale
 * @param {Array} array 
 * @param {number} id 
 * @returns {Array}
 */
function deliteCardDeck(array, id){
    for(var i = 0; i < 2; i++){
        var index = array.indexOf(id);
        array.splice(index,1);
    }
    return array;
}

/**
 * Imposta l'evento a ogni elemento html iterato
 * @param {*} ele 
 */
function setEventCard(ele){
    ele.addEventListener('click', (event) =>{
        var idCard = Array.from(cards).indexOf(event.target);
        logicGame(idCard, event.target, fullDeck);
    });
}


/**
 * Funzione che stampa le carte di gioco sull'html
 * @param {number} num
 * @param {string} pathImg
 */
function getCard(num, pathImg){
    for(var i = 0; i < num; i++){
        //Elemento div flex item
        var divCol = document.createElement('div');
        divCol.className = 'col-' + (12 / width);
        //Elemento img
        var img = document.createElement('img');
        img.src = pathImg;
        img.className = 'card';
        divCol.appendChild(img);
        //Elemento griglia di gioco
        document.getElementById('grid').appendChild(divCol);
    }
}

/**
 * Genera numeri random compresi i due estremi
 * @param {num} min 
 * @param {num} max 
 * @returns {num}
 */
function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera il numero di carte del mazzo e li inserisce in array
 * @param {number} qty 
 * @returns {Array} numeri del mazzo di carte
 */
function generateDeck(qty){
    var deck = [];
    var middleQty = qty / 2;
    while(deck.length < middleQty){
        var randomDeck = getRandomNumber(1, middleQty);
        if(!deck.includes(randomDeck)){
            deck.push(randomDeck);
        }
    }
    return deck;
}
