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
  li.innerText = address.place_name + " - " + address.address_name;

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
          address +
          (roadAddress ? " (" + roadAddress + ")" : "");
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
      var address = detailAddress.address_name;
      var roadAddress = result[0].road_address;
      callback({ address: address, roadAddress: roadAddress });
    }
  });
}

// 지도 클릭 이벤트
kakao.maps.event.addListener(map, "click", function () {
  infowindow.close();
});

// 중간 지점 주변 맛집 검색 버튼 클릭 이벤트
document
  .getElementById("search-restaurants")
  .addEventListener("click", function () {
    if (centerMarker) {
      const centerLatLng = centerMarker.getPosition();
      const keyword =
        document.getElementById("center-address").innerText + " 주변 맛집";
      searchRestaurants(keyword, centerLatLng);
    } else {
      alert("중간 지점을 먼저 계산해주세요.");
    }
  });

// 맛집 검색 함수
function searchRestaurants(keyword, centerLatLng) {
  var ps = new kakao.maps.services.Places(map);
  ps.keywordSearch(
    keyword,
    function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        displayRestaurantMarkers(result);
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

// 검색된 맛집 마커 표시 함수
function displayRestaurantMarkers(restaurants) {
  restaurants.forEach(function (restaurant) {
    var latlng = new kakao.maps.LatLng(restaurant.y, restaurant.x);
    var marker = new kakao.maps.Marker({
      position: latlng,
      image: new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new kakao.maps.Size(24, 35)
      ),
    });
    marker.setMap(map);
    kakao.maps.event.addListener(marker, "click", function () {
      displayInfowindow(marker, restaurant.place_name);
    });
  });
}
