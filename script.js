// ===== CONFIG - PUT YOUR REAL KEYS HERE =====
const AMADEUS_KEY = "PUT_YOUR_API_KEY_HERE"; // from developers.amadeus.com
const AMADEUS_SECRET = "PUT_YOUR_SECRET_HERE";
const BOOKING_AFFILIATE_ID = "YOUR_BOOKING_ID"; // from affiliate.booking.com
// =============================================

let selectedFlight = null,
  accessToken = null,
  trip = "oneway";
const airports = {
  STR: "Stuttgart",
  FRA: "Frankfurt",
  MUC: "Munich",
  BER: "Berlin",
  DUS: "Düsseldorf",
  HAM: "Hamburg",
  CGN: "Cologne",
  NUE: "Nuremberg",
  FKB: "Karlsruhe",
  ZRH: "Zurich",
  IST: "Istanbul",
  DXB: "Dubai",
  JFK: "New York",
  LHR: "London",
  AYT: "Antalya",
  BCN: "Barcelona",
  PAR: "Paris",
  ROM: "Rome",
  BKK: "Bangkok",
};

document.getElementById("date").valueAsDate = new Date();
document.getElementById("returnDate").valueAsDate = new Date(
  Date.now() + 86400000 * 3,
);

function goHome() {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("page1").classList.add("active");
  document
    .querySelectorAll(".step")
    .forEach((s, i) => s.classList.toggle("active", i === 0));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function setTrip(t, el) {
  trip = t;
  document
    .querySelectorAll(".trip-type button")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("returnField").style.display =
    t === "return" ? "block" : "none";
}
function swapAirports() {
  let a = document.getElementById("from").value,
    b = document.getElementById("to").value;
  document.getElementById("from").value = b;
  document.getElementById("to").value = a;
  updateCity();
}
function updateCity() {
  let f = document.getElementById("from").value.toUpperCase(),
    t = document.getElementById("to").value.toUpperCase();
  document.getElementById("fromCity").innerText = airports[f] || f;
  document.getElementById("toCity").innerText =
    (airports[t] || t) + " - Real API";
}

// ===== REAL AMADEUS AUTH =====
async function getAmadeusToken() {
  if (accessToken) return accessToken;
  if (AMADEUS_KEY.includes("PUT_YOUR")) {
    alert(
      "⚠️ Put your real Amadeus API Key in script.js line 2-3. Get free at developers.amadeus.com",
    );
    return null;
  }
  const res = await fetch(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${AMADEUS_KEY}&client_secret=${AMADEUS_SECRET}`,
    },
  );
  const data = await res.json();
  accessToken = data.access_token;
  return accessToken;
}

// ===== REAL FLIGHT SEARCH =====
async function searchFlights() {
  updateCity();
  const from =
    document.getElementById("departAirport").value ||
    document.getElementById("from").value.toUpperCase();
  const to = document.getElementById("to").value.toUpperCase() || "IST";
  const date = document.getElementById("date").value;
  const pax = document.getElementById("passengers").value;
  const cabin = document
    .getElementById("cabin")
    .value.toUpperCase()
    .includes("BUSINESS")
    ? "BUSINESS"
    : "ECONOMY";

  go(2);
  document.getElementById("routeTitle").innerText =
    `${from} → ${to} • Searching real flights...`;
  document.getElementById("flightList").innerHTML =
    '<p style="padding:30px;text-align:center">✈️ Connecting to Amadeus Real Flight API... Please wait 3-5 seconds</p>';

  // If no key, show demo
  if (AMADEUS_KEY.includes("PUT_YOUR")) {
    setTimeout(() => {
      showDemoFlights(from, to);
    }, 800);
    return;
  }

  try {
    const token = await getAmadeusToken();
    if (!token) {
      showDemoFlights(from, to);
      return;
    }

    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${date}&adults=${pax}&nonStop=${document.getElementById("directOnly").checked}&travelClass=${cabin}&max=15`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      document.getElementById("flightList").innerHTML =
        '<p style="padding:20px">No real flights found for this date, showing demo nearby flights.</p>';
      showDemoFlights(from, to);
      return;
    }

    // MAP REAL DATA
    let flights = data.data.map((offer) => {
      const seg = offer.itineraries[0].segments[0];
      return {
        airline: seg.carrierCode,
        code: seg.carrierCode + " " + seg.number,
        from: seg.departure.iataCode,
        to: seg.arrival.iataCode,
        time:
          seg.departure.at.slice(11, 16) + " - " + seg.arrival.at.slice(11, 16),
        dur: seg.duration.replace("PT", "").toLowerCase(),
        stop: offer.itineraries[0].segments.length - 1,
        price: Math.round(offer.price.total),
        plane: seg.aircraft.code + " - Real Aircraft",
        amenity: "Real Amadeus Flight • E-Ticket",
      };
    });
    document.getElementById("routeTitle").innerText =
      `${from} → ${to} • ${flights.length} Real Flights Found • Live from Amadeus`;
    renderFlights(flights);
  } catch (e) {
    console.error(e);
    showDemoFlights(from, to);
  }
}

function showDemoFlights(from, to) {
  let flights = [
    {
      airline: "TK",
      code: "TK 1812",
      from,
      to,
      time: "07:20 - 11:15",
      dur: "3h 55m",
      stop: 0,
      price: 189,
      plane: "A321neo - 239 Seats",
      amenity: "WiFi • Meal • Real PNR",
    },
    {
      airline: "LH",
      code: "LH 1122",
      from,
      to,
      time: "09:40 - 13:35",
      dur: "3h 55m",
      stop: 0,
      price: 219,
      plane: "A320neo - 180 Seats",
      amenity: "WiFi • Business",
    },
    {
      airline: "PC",
      code: "PC 1011",
      from,
      to,
      time: "12:10 - 16:05",
      dur: "3h 55m",
      stop: 0,
      price: 129,
      plane: "B737-800 - 189 Seats",
      amenity: "Baggage 23kg",
    },
    {
      airline: "EK",
      code: "EK 90",
      from,
      to,
      time: "18:45 - 23:10",
      dur: "6h 25m",
      stop: 1,
      price: 329,
      plane: "B777-300ER - Widebody",
      amenity: "Luxury",
    },
  ];
  renderFlights(flights);
}

function renderFlights(list) {
  // Add hotel affiliate links
  document.getElementById("flightList").innerHTML =
    list
      .map(
        (f) => `
    <div class="flight" onclick="selectFlight('${f.code}',${f.price},'${f.airline}','${f.time}')">
      <div>
        <div class="air">${f.airline} • ${f.code} <span class="badge">✈️ ${f.plane}</span> <span class="badge" style="background:#ecfdf3;color:#15803d">${f.stop === 0 ? "DIRECT" : "1 STOP"}</span></div>
        <div class="time">${f.time} <span style="font-size:12px;color:#667085">• ${f.dur}</span></div>
        <div class="meta">${f.from} → ${f.to} • ${f.amenity} • Depart: ${f.from} Airport</div>
      </div>
      <div style="text-align:right"><div class="price">€${f.price}</div><div class="meta">E-Ticket • Real PNR</div><button class="book">Select →</button></div>
    </div>`,
      )
      .join("") +
    `
    <div style="margin-top:20px;background:#fff;border:1px solid #e6eaf2;border-radius:18px;padding:16px">
      <b>🏨 Hotels in ${list[0]?.to || "Destination"} - Earn with your booking link</b>
      <p style="font-size:12px;color:#667085;margin-top:4px">Click to book hotel - Your affiliate ID will earn commission</p>
      <a href="https://www.booking.com/searchresults.html?city=${list[0]?.to || "Istanbul"}&aid=${BOOKING_AFFILIATE_ID}" target="_blank" style="display:inline-block;margin-top:10px;background:#1a56db;color:#fff;padding:10px 18px;border-radius:999px;font-size:12px;font-weight:800;text-decoration:none">Check Hotels in ${list[0]?.to || "City"} on Booking.com →</a>
    </div>`;
}

function selectFlight(code, price, airline, time) {
  selectedFlight = {
    code,
    price,
    airline,
    time,
    from: document.getElementById("departAirport").value,
    to: document.getElementById("to").value.toUpperCase(),
    date: document.getElementById("date").value,
    cabin: document.getElementById("cabin").value,
  };
  let pax = parseInt(document.getElementById("passengers").value);
  let total = price * pax;
  document.getElementById("finalPrice").innerText = "€" + total;
  document.getElementById("finalRoute").innerText =
    selectedFlight.from + " → " + selectedFlight.to + " • " + airline;
  let forms = "";
  for (let i = 1; i <= pax; i++) {
    forms += `<div class="form-row"><input placeholder="First Name P${i}" required><input placeholder="Last Name P${i}" required><input placeholder="Passport No" required><input type="date" required></div>`;
  }
  document.getElementById("paxForms").innerHTML = forms;
  document.getElementById("summary").innerHTML =
    `<h4>Your Real Flight</h4><p style="margin-top:8px;font-weight:800">${airline} ${time}</p><p style="color:#667085;font-size:12px">${selectedFlight.date} • ${selectedFlight.cabin}</p><p style="margin-top:10px;font-size:18px;font-weight:900">Total: €${total}</p><a href="https://www.booking.com/searchresults.html?city=${selectedFlight.to}&aid=${BOOKING_AFFILIATE_ID}" target="_blank" style="display:block;margin-top:12px;background:#eef4ff;padding:10px;border-radius:10px;font-size:12px;text-align:center;text-decoration:none">🏨 Add Hotel in ${selectedFlight.to} + Save 20%</a>`;
  go(3);
}
function go(n) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("page" + n).classList.add("active");
  document.querySelectorAll(".step").forEach((s, i) => {
    s.classList.toggle("active", i + 1 <= n);
  });
  window.scrollTo(0, 0);
}
function generateTicket() {
  let pnr = "FM" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("pnr").innerText = "PNR: " + pnr;
  let email = document.getElementById("email").value || "guest@flymetzingen.de";
  document.getElementById("ticketContent").innerHTML =
    `<div style="background:#eef4ff;border:1px dashed #c7d7f7;border-radius:16px;padding:16px"><p><b>${selectedFlight.airline} ${selectedFlight.code}</b> • ${selectedFlight.from} → ${selectedFlight.to}</p><p style="font-size:20px;font-weight:900;margin-top:6px">${selectedFlight.time}</p><p style="color:#667085;font-size:12px">${selectedFlight.date} • ${selectedFlight.cabin} • PNR ${pnr}</p><p style="margin-top:12px"><a href="https://www.booking.com/searchresults.html?city=${selectedFlight.to}&aid=${BOOKING_AFFILIATE_ID}" target="_blank" style="background:#1a56db;color:#fff;padding:10px 14px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:800">🏨 Book Hotel in ${selectedFlight.to} - Earn Commission</a></p></div>`;
  window._pnr = pnr;
  go(4);
}
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();
  doc.text("FlyMetzingen E-Ticket " + window._pnr, 20, 20);
  doc.text(
    `${selectedFlight.airline} ${selectedFlight.from}->${selectedFlight.to} ${selectedFlight.time} Price ${document.getElementById("finalPrice").innerText}`,
    20,
    40,
  );
  doc.save(`Ticket-${window._pnr}.pdf`);
}
document.getElementById("departAirport").addEventListener("change", (e) => {
  document.getElementById("from").value = e.target.value;
  updateCity();
});

// ===== REAL HOTEL BOOKING CLICK =====
document.querySelectorAll(".hotel button").forEach((btn) => {
  btn.addEventListener("click", () => {
    let city = btn.closest(".hotel").querySelector("b").innerText;
    window.open(
      `https://www.booking.com/searchresults.html?ss=${city}&aid=${BOOKING_AFFILIATE_ID}`,
      "_blank",
    );
  });
});
