const apiURL = "http://localhost:3000/api"
let currentItem
let items

const itemDetailsDIV = document.querySelector("#itemdetails")
const quantity = document.querySelector("#quantity")
const header = document.querySelector("#header")
const nav = document.querySelector("#nav")
const purchaseFORM = document.querySelector("#purchase-form")

purchaseFORM.addEventListener('submit', onPurchase)

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id'); // Get the 'id' query parameter.

    if (itemId) {
        // const items = JSON.parse(localStorage.getItem('items'));
        const response = await fetch(`${apiURL}/items/`)
        items = await response.json()

        currentItem = items.find(i => i.id== itemId);
        if (currentItem) {
            displayItemInfo();
        } else {
            console.error('Item not found');
        }
    }
});

function displayItemInfo() {
    itemDetailsDIV.innerHTML=`
            <section class="item-details info">
                <p class="info-title">Information</p>
                <p class="item-title">Title: ${currentItem.title}</p>
                <p class="item-quantity">Number of Items Available: ${currentItem.available_quantity}</p>
                <p class="item-price">Price: ${currentItem.price}</p> 
                <p>Category: ${currentItem.category}</p>
                <p>ID: ${currentItem.id}</p>
                <p>Artist: ${currentItem.artist}</p>
                
            </section>
            `
    quantity.innerHTML =`
        <button id="decreaseQuantity" type="button">-</button>
        <p>${currentItem.quantity_to_buy}</p>
        <button id="increaseQuantity" type="button">+</button>
    `
    document.querySelector("#decreaseQuantity").addEventListener('click', decreaseQuantity)
    document.querySelector("#increaseQuantity").addEventListener('click', increaseQuantity)
}

async function findItemAndUpdateQuantity(change) {
    if(currentItem){
        const newQuantity = currentItem.quantity_to_buy+change

        if(newQuantity>=0 && currentItem.available_quantity>=newQuantity){
            currentItem.quantity_to_buy=newQuantity
            await fetch(`${apiURl}/items/${currentItem.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': "application/json", },
                    body: JSON.stringify(currentItem)
                });
            displayItemInfo(currentItem)
        }

        else{
            alert("Quantity is less than 0 or greater than available quantity")
        }
    }
    else{
        alert("Item not found.")
    }
}

function decreaseQuantity() {
    findItemAndUpdateQuantity(-1)
}

function increaseQuantity() {
    findItemAndUpdateQuantity(1)
}


async function onPurchase(e){

    e.preventDefault()

    // const users = JSON.parse(localStorage.getItem('users'))
    // const artist = users.find(a=> a.id == currentItem.artistID)
    const response1 = await fetch(`${apiURL}/customers/`)
    const users = await response1.json()
    const artist = currentItem.Artist

    const loggedInUser = users.find(u => u.isLoggedIn == true)

    const amountToBePaid = currentItem.quantity_to_buy*currentItem.price
    

    if(loggedInUser.balance>amountToBePaid && currentItem.quantity_to_buy > 0 && currentItem.quantity_to_buy <= currentItem.available_quantity){
        loggedInUser.balance-=amountToBePaid
        currentItem.available_quantity-=currentItem.quantity_to_buy
        currentItem.sold += currentItem.quantity_to_buy
        //Update available quantity
        const itemIndex = items.findIndex(item => item.ID == currentItem.ID);
        if (itemIndex !== -1) {
            items[itemIndex] =currentItem;
        }else{
            alert("item not found.")
        }
        // localStorage.setItem('items', JSON.stringify(items))

        //Update purchase/sale histories
        // loggedInUser.purchaseHistory.push(currentItem)
        // if(artist){
        //     artist.soldItems.push(currentItem)
        // }
        // else{
        //     console.log("artist not found.");
        // }
        // currentItem.clients.push(loggedInUser.username)

        // localStorage.setItem('users', JSON.stringify(users))
        // localStorage.setItem('items', JSON.stringify(items))
        await fetch(`${apiURl}/transactions/${currentItem.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': "application/json", },
                    body: JSON.stringify(currentItem)
                });
        
        // const currentItemId = items.findIndex( i => i.id == currentItem.id);
        // const clientIndex = users.findIndex(u => u.username == loggedInUser.username);
        // users[clientIndex] = loggedInUser;

        alert(`Purchase sucessful\nNew balance: ${loggedInUser.balance}\nNew available quantity: ${currentItem.available_quantity}`)
        window.location.href = `/html/main.html`
    }
    else{
        alert("Insufficient balance.")
    }
}

function formToObject(form){
    const formData = new FormData(form)
    const data = {}

    for(const [key, value] of formData){
        data[key] = value
    }

    return data;
}