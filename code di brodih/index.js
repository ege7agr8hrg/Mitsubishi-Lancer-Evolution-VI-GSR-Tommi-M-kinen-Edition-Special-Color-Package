const slides=document.querySelector(".slides")
const slide=document.querySelectorAll(".slide")

const next=document.querySelector(".next")
const prev=document.querySelector(".prev")

const dotsContainer=document.querySelector(".dots")

let index=0

slide.forEach((_,i)=>{
let dot=document.createElement("span")
dot.addEventListener("click",()=>goToSlide(i))
dotsContainer.appendChild(dot)
})

const dots=document.querySelectorAll(".dots span")

function updateSlider(){
slides.style.transform=`translateX(-${index*100}%)`

dots.forEach(d=>d.classList.remove("active"))
dots[index].classList.add("active")
}

function nextSlide(){
index++
if(index>=slide.length) index=0
updateSlider()
}

function prevSlide(){
index--
if(index<0) index=slide.length-1
updateSlider()
}

function goToSlide(i){
index=i
updateSlider()
}

next.onclick=nextSlide
prev.onclick=prevSlide

updateSlider()

setInterval(nextSlide,5000)

function inputaccount(){
    window.location.href = './account.html';
}