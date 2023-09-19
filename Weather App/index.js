const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially variables need

let oldTab = userTab;
const API_KEY = "1236a7584b96b1328c05f56823464abc";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
  if (newTab != oldTab) {
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      //is searchForm is invisible,if it is then make it visible
      userInfoContainer.classList.remove("active");
      grantAccessContainer.remove("active");
      searchForm.classList.add("active");
    } else {
      //we were in searchTab and now we have to switch to your weather
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      //now we are in your weather tab, and weather need to be displayed,so let's check local storage first
      //for coordinates,if we have saved them there.
      getfromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  //pass clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  //pass clicked tab as input parameter
  switchTab(searchTab);
});

//check if coordinates are already present in session storage
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    //if didn't got localcoordinates
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  //make grantcontainer invisible
  grantAccessContainer.classList.remove("active");
  //make loader visible
  loadingScreen.classList.add("active");

  //API call
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    console.log("Error Found", err);
  }
}

function renderWeatherInfo(weatherInfo) {
  //first we have to fetch the elements

  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  //fetch values from WeatherInfo object and put it in UI elements
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity} %`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("No geolocation support");
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") return;
  else fetchSearchhWeatherInfo(cityName);
});

//error container is fetched to handle error
const errorContainer = document.querySelector(".errorContainer");

async function fetchSearchhWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      loadingScreen.classList.remove("active");
      // If the response is not successful, throw an error with the status text
      throw new Error("Weather data not available for this location.");
    }

    const data = await response.json();
    loadingScreen.classList.remove("active");

    userInfoContainer.classList.add("active");

    renderWeatherInfo(data);

    // Clear the error message container if previously shown
    errorContainer.style.display = "none";
  } catch (err) {
    // Handle the error
    console.error("Error fetching weather data:", err.message);

    // Display an error message to the user

    errorContainer.textContent = "An error occurred: " + err.message;
    errorContainer.style.display = "block";
  }
}
