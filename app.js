const userTab = document.querySelector('[data-userWeather]')
const searchTab = document.querySelector('[data-searchWeather]')
const userContainer = document.querySelector('.weather-container')
const grantAccessContainer = document.querySelector('.grant-location-container')
const searchForm = document.querySelector('.form-container')
const loadingScreen = document.querySelector('.loading-container')
const userInfoContainer = document.querySelector('.user-info-container')

let currentTab = userTab;
const API_KEY = "0377d33e1a1dfd1aa2a2093b1f7a89bb";

currentTab.classList.add('current-tab');

getfromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove('current-tab');
        currentTab=clickedTab;
        currentTab.classList.add('current-tab')

        if(!searchForm.classList.contains('active')){
            userInfoContainer.classList.remove('active')
            grantAccessContainer.classList.remove('active')
            searchForm.classList.add('active') 
        }
        else{
            searchForm.classList.remove('active')
            userInfoContainer.classList.remove('active')
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click',()=>{
    switchTab(userTab)
})

searchTab.addEventListener('click',()=>{
    switchTab(searchTab)
})

// Check if coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if(!localCoordinates){
        grantAccessContainer.classList.add('active')
    }
    else{
        const coordinates  = JSON.parse(localCoordinates)
        fetchUserWeatherInfo(coordinates)
    }
}

async function fetchUserWeatherInfo(coordinates){
    const{lat,lon} = coordinates;
    // Make grant container invisible
    grantAccessContainer.classList.remove('active')
    loadingScreen.classList.add('active')

    // API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data= await response.json();
        loadingScreen.classList.remove('active')
        userInfoContainer.classList.add('active')

        renderWeatherInfo(data);

    }   
    catch(err){
        console.log('ERROR',err)
    }
}

function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector('[data-cityName]');
    const countryFlag = document.querySelector('[data-countryFlag]');
    const description = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const clouds = document.querySelector('[data-clouds]');

    cityName.innerText = weatherInfo?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    description.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

const grantAccessButton = document.querySelector('[data-grantAccess]')
grantAccessButton.addEventListener('click',getLocation);

function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        grantAccessContainer.classList.remove('active');
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const searchInput = document.querySelector('[data-searchInput]');

searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return ;
    }
    else{
        fetchSearchWeatherInfo(cityName)
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add('active')
    userInfoContainer.classList.remove('active')
    grantAccessButton.classList.remove('active')

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data); 
    }
    catch(err){
        console.log('ERROR',err)
    }
}