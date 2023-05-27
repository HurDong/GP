// 지도 생성 및 초기화
var mapContainer = document.getElementById("map");
var mapOption = {
  center: new kakao.maps.LatLng(37.553, 126.9249),
  level: 7,
};

var map = new kakao.maps.Map(mapContainer, mapOption);
var zoomControl = new kakao.maps.ZoomControl();
var infowindow = new kakao.maps.InfoWindow();

map.addControl(zoomControl, kakao.maps.ControlPosition.LEFTBOTTOM);
const markers = [];
let centerMarker;

// 마커들의 중심점 계산 함수
function calculateCenter(markers) {
  let latSum = 0;
  let lngSum = 0;

  markers.forEach(function (marker) {
    latSum += marker.getPosition().getLat();
    lngSum += marker.getPosition().getLng();
  });

  return new kakao.maps.LatLng(
    latSum / markers.length,
    lngSum / markers.length
  );
}

// 검색 기능
var searchBox = document.getElementById("search-box");
var geocoder = new kakao.maps.services.Geocoder();

searchBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchAddress(searchBox.value);
  }
});

// 주소 검색 함수
function searchAddress(keyword) {
  var ps = new kakao.maps.services.Places(map);
  ps.keywordSearch(keyword, function (result, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      showAddressList(result);
    } else {
      alert("검색 결과가 없습니다.");
    }
  });
}

// 주소 검색 결과 출력 함수
function showAddressList(addresses) {
  var searchResultWindow = window.open(
    "",
    "searchResultWindow",
    "width=400,height=600"
  );
  searchResultWindow.document.write("<h2>주소 검색 결과</h2>");

  // 스타일 태그 추가
  var style = document.createElement("style");
  style.innerHTML = `
  body {
    background-color: #f0f0f0;
    font-family: Arial, sans-serif;
  }

  h2 {
    color: #333;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    border: 1px solid #ddd;
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
    transition: background-color 0.2s;
  }

  li:hover {
    background-color: #ddd;
  }
  `;
  searchResultWindow.document.head.appendChild(style);

  var list = document.createElement("ul");
  searchResultWindow.document.body.appendChild(list);

  addresses.forEach(function (address) {
    var li = document.createElement("li");
    li.innerText = address.place_name + " - " + address.address_name;
    li.onclick = function () {
      addAddressMarker(address);
      searchResultWindow.close();
    };
    list.appendChild(li);
  });
}

// 주소에 마커 추가 함수
function addAddressMarker(address) {
  var latlng = new kakao.maps.LatLng(address.y, address.x);
  var marker = new kakao.maps.Marker({ position: latlng });
  marker.setMap(map);
  markers.push(marker);

  kakao.maps.event.addListener(marker, "click", function () {
    displayInfowindow(marker, address.place_name);
  });

  var addressList = document.getElementById("address-list");
  var li = document.createElement("li");

  // addressList의 현재 아이템 수를 얻어서 번호를 만듭니다.
  var number = addressList.getElementsByTagName("li").length + 1;

  // 주소 앞에 번호를 붙여서 텍스트를 설정합니다.
  li.innerText =
    number + ". " + address.place_name + " - " + address.address_name;

  li.addEventListener("click", function () {
    var moveLatLng = new kakao.maps.LatLng(address.y, address.x);
    map.panTo(moveLatLng);
  });

  addressList.appendChild(li);
}

// 중간 지점 계산 버튼 클릭 이벤트
document.getElementById("meet-button").addEventListener("click", function () {
  if (markers.length >= 2) {
    if (centerMarker) {
      centerMarker.setMap(null);
    }
    const centerLatLng = calculateCenter(markers);
    centerMarker = new kakao.maps.Marker({
      position: centerLatLng,
      image: new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new kakao.maps.Size(40, 40)
      ),
    });
    centerMarker.setMap(map);

    getAddressFromLatLng(
      centerLatLng.getLat(),
      centerLatLng.getLng(),
      function (result) {
        const address = result.address;
        const roadAddress = result.roadAddress;
        const title =
          "중간 지점 - " +
          address.address +
          (address.roadAddress ? " (" + address.roadAddress + ")" : "");

        kakao.maps.event.addListener(centerMarker, "click", function () {
          displayInfowindow(centerMarker, title);
        });
      }
    );
    showCenterAddress(centerLatLng);
  } else {
    alert("적어도 2개의 마커가 필요합니다.");
  }
});

// 리셋 버튼 클릭 이벤트
document.getElementById("reset-button").addEventListener("click", function () {
  markers.forEach(function (marker) {
    marker.setMap(null);
  });
  markers.length = 0;
  if (centerMarker) {
    centerMarker.setMap(null);
    centerMarker = null;
  }

  var addressList = document.getElementById("address-list");
  while (addressList.firstChild) {
    addressList.removeChild(addressList.firstChild);
  }

  // 중간 지점 주소 초기화
  document.getElementById("center-address").innerText = "";
});

// 중간 지점 주소 출력 함수
function showCenterAddress(latlng) {
  geocoder.coord2Address(
    latlng.getLng(),
    latlng.getLat(),
    function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const centerAddress = result[0].address.address_name;
        document.getElementById("center-address").innerText = centerAddress;
      }
    }
  );
}

// 정보창 표시 함수
function displayInfowindow(marker, title) {
  var content =
    '<div style="padding:5px;max-width:200px;white-space:normal;word-wrap:break-word;z-index:1;">' +
    title +
    "</div>";

  infowindow.setContent(content);
  infowindow.open(map, marker);
}

// 위도와 경도로부터 주소 가져오기 함수
function getAddressFromLatLng(lat, lng, callback) {
  geocoder.coord2Address(lng, lat, function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      var detailAddress = result[0].address;
      var address = detailAddress ? detailAddress.address_name : undefined;
      var roadAddress = result[0].road_address
        ? result[0].road_address.address_name
        : undefined;
      callback({ address: address, roadAddress: roadAddress });
    }
  });
}

// 지도 클릭 이벤트
kakao.maps.event.addListener(map, "click", function () {
  infowindow.close();
});

// 중간 지점 계산 버튼 클릭 이벤트
document.getElementById("meet-button").addEventListener("click", function () {
  if (markers.length >= 2) {
    if (centerMarker) {
      centerMarker.setMap(null);
    }
    const centerLatLng = calculateCenter(markers);
    centerMarker = new kakao.maps.Marker({
      position: centerLatLng,
      image: new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new kakao.maps.Size(40, 40)
      ),
    });
    centerMarker.setMap(map);

    getAddressFromLatLng(
      centerLatLng.getLat(),
      centerLatLng.getLng(),
      function (result) {
        const address = result.address ? result.address : "주소 정보 없음";
        const title = "중간 지점 - " + address;
        kakao.maps.event.addListener(centerMarker, "click", function () {
          displayInfowindow(centerMarker, title);
        });
      }
    );
    showCenterAddress(centerLatLng);
  } else {
    alert("적어도 2개의 마커가 필요합니다.");
  }
});
// 맛집 검색 버튼 클릭 이벤트
document
  .getElementById("search-restaurants")
  .addEventListener("click", function () {
    if (centerMarker) {
      const centerLatLng = centerMarker.getPosition();
      searchRestaurants("맛집", centerLatLng);
    } else {
      alert("중간 지점을 먼저 계산해주세요.");
    }
  });

let currentRestaurantPage = 0;
const restaurantsPerPage = 5;
let restaurants = []; // 이 배열은 실제 맛집 데이터를 포함해야 합니다.

function showRestaurants() {
  const start = currentRestaurantPage * restaurantsPerPage;
  const end = start + restaurantsPerPage;

  const restaurantsToShow = restaurants.slice(start, end);
  const restaurantList = document.getElementById("restaurant-list");

  restaurantList.innerHTML = ""; // 목록을 비웁니다.

  for (let i = 0; i < restaurantsToShow.length; i++) {
    const restaurant = restaurantsToShow[i];
    const li = document.createElement("li");
    li.textContent = `${start + i + 1}. ${restaurant.place_name} - ${
      restaurant.address_name
    }`;
    li.addEventListener("click", function () {
      map.panTo(restaurantMarkers[start + i].getPosition());
    });
    restaurantList.appendChild(li);
  }
}

document
  .getElementById("prev-restaurants")
  .addEventListener("click", function () {
    if (currentRestaurantPage > 0) {
      currentRestaurantPage--;
      showRestaurants();
    }
  });

document
  .getElementById("next-restaurants")
  .addEventListener("click", function () {
    if ((currentRestaurantPage + 1) * restaurantsPerPage < restaurants.length) {
      currentRestaurantPage++;
      showRestaurants();
    }
  });

// 맛집 검색 함수
function searchRestaurants(keyword, centerLatLng) {
  var ps = new kakao.maps.services.Places(map);
  ps.keywordSearch(
    keyword,
    function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        restaurants = result; // Store the search results in the global variable
        currentRestaurantPage = 0; // Reset the current page
        displayRestaurantMarkers(restaurants);
        showRestaurants(); // Show the restaurants in the list
      } else {
        alert("검색 결과가 없습니다.");
      }
    },
    {
      location: centerLatLng,
      radius: 1000,
    }
  );
}
// 맛집 마커를 저장할 배열을 추가합니다.
const restaurantMarkers = [];

// 검색된 맛집 마커 표시 함수를 수정합니다.
function displayRestaurantMarkers(restaurants) {
  const restaurantList = document.getElementById("restaurant-list");
  restaurantList.innerHTML = ""; // Clear the list first
  restaurantMarkers.length = 0; // Clear the restaurant markers array

  restaurants.forEach(function (restaurant, index) {
    var latlng = new kakao.maps.LatLng(restaurant.y, restaurant.x);
    var marker = new kakao.maps.Marker({
      position: latlng,
      image: new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new kakao.maps.Size(24, 35)
      ),
    });
    marker.setMap(map);
    restaurantMarkers.push(marker); // Add the marker to the array

    kakao.maps.event.addListener(marker, "click", function () {
      displayInfowindow(marker, restaurant.place_name);
    });

    // Add restaurant to the list
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${restaurant.place_name} - ${
      restaurant.address_name
    }`;
    li.addEventListener("click", function () {
      map.panTo(marker.getPosition()); // Move the map to the marker's position
    });
    restaurantList.appendChild(li);
  });
}
