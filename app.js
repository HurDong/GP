var mapContainer = document.getElementById("map");
var mapOption = {
  center: new kakao.maps.LatLng(37.553, 126.9249),
  level: 7,
};

var map = new kakao.maps.Map(mapContainer, mapOption);
const markers = [];
let centerMarker;

map.addListener("click", function (mouseEvent) {
  const latlng = mouseEvent.latLng;
  const marker = new kakao.maps.Marker({ position: latlng });
  marker.setMap(map);
  markers.push(marker);
});

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

// Search
var searchBox = document.getElementById("search-box");
var geocoder = new kakao.maps.services.Geocoder();

searchBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchAddress(searchBox.value);
  }
});

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

function addAddressMarker(address) {
  var latlng = new kakao.maps.LatLng(address.y, address.x);
  var marker = new kakao.maps.Marker({ position: latlng });
  marker.setMap(map);
  markers.push(marker);

  var addressList = document.getElementById("address-list");
  var li = document.createElement("li");
  li.innerText = address.place_name + " - " + address.address_name;
  addressList.appendChild(li);
}

// 중간 지점 계산 및 표시
document.getElementById("meet-button").addEventListener("click", function () {
  if (markers.length >= 2) {
    if (centerMarker) {
      centerMarker.setMap(null);
    }
    const centerLatLng = calculateCenter(markers);
    centerMarker = new kakao.maps.Marker({
      position: centerLatLng,
      image: new kakao.maps.MarkerImage(
        "https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740_960_720.png",
        new kakao.maps.Size(40, 40)
      ),
    });
    centerMarker.setMap(map);
  } else {
    alert("적어도 2개의 마커가 필요합니다.");
  }
});
// 마커 초기화 기능
document.getElementById("reset-button").addEventListener("click", function () {
  markers.forEach(function (marker) {
    marker.setMap(null);
  });
  markers.length = 0;
  if (centerMarker) {
    centerMarker.setMap(null);
    centerMarker = null;
  }

  // 주소 목록 초기화
  var addressList = document.getElementById("address-list");
  while (addressList.firstChild) {
    addressList.removeChild(addressList.firstChild);
  }
});
