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

  // 클릭 이벤트 추가
  kakao.maps.event.addListener(marker, "click", function () {
    displayInfowindow(
      marker,
      address.place_name + " - " + address.address_name
    );
  });

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
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new kakao.maps.Size(40, 40)
      ),
    });
    centerMarker.setMap(map);

    // 중간 지점 마커에 정보 창 추가
    getAddressFromLatLng(
      centerLatLng.getLat(),
      centerLatLng.getLng(),
      function (address) {
        kakao.maps.event.addListener(centerMarker, "click", function () {
          displayInfowindow(centerMarker, "중간 지점 - " + address);
        });
      }
    );
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

function showCenterAddress(latlng) {
  geocoder.coord2RegionCode(
    latlng.getLng(),
    latlng.getLat(),
    function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const centerAddress = result[0].address_name;
        document.getElementById("center-address").innerText = centerAddress;
      }
    }
  );
}

function displayInfowindow(marker, title) {
  var content =
    '<div style="padding:5px;max-width:200px;white-space:normal;word-wrap:break-word;z-index:1;">' +
    title +
    "</div>";

  infowindow.setContent(content);
  infowindow.open(map, marker);
}

function getAddressFromLatLng(lat, lng, callback) {
  geocoder.coord2Address(lng, lat, function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      var detailAddress = result[0].address;
      var address = detailAddress.address_name;
      callback(address);
    }
  });
}

kakao.maps.event.addListener(map, "click", function () {
  infowindow.close();
});
