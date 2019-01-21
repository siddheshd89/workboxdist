/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
function createIndexedDB() {
  if (!('indexedDB' in window)) {return null;}
  return idb.open('dashboardr', 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('events')) {
      const eventsOS = upgradeDb.createObjectStore('events', {keyPath: 'id'});
    }
  });
}

// TODO - register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log(`Service Worker registered! Scope: ${registration.scope}`);
      })
      .catch(err => {
        console.log(`Service Worker registration failed: ${err}`);
      });
  });
}

const container = document.getElementById('container');
const addEventButton = document.getElementById('add-event-button');
const deleteEventButton = document.getElementById('delete-event-button'); 

addEventButton.addEventListener('click', addAndPostEvent);

Notification.requestPermission();

// TODO - create indexedDB database
const dbPromise = createIndexedDB();

function saveEventDataLocally(events) {
	  if (!('indexedDB' in window)) {return null;}
	  return dbPromise.then(db => {
		const tx = db.transaction('events', 'readwrite');
	    const store = tx.objectStore('events');
	    return Promise.all(events.map(event => store.put(event)))
	    .catch(() => {
	      tx.abort();
	      throw Error('Events were not added to the store');
	    });
	  });
	}

loadContentNetworkFirst();

function getLocalEventData() {
	  if (!('indexedDB' in window)) {return null;}
	  return dbPromise.then(db => {
	    const tx = db.transaction('events', 'readonly');
	    const store = tx.objectStore('events');
	    return store.getAll();
	  });
	}

function loadContentNetworkFirst() {
	  getServerData()
	  .then(dataFromNetwork => {
	    updateUI(dataFromNetwork);
	    saveEventDataLocally(dataFromNetwork)
	    .then(() => {
	      setLastUpdated(new Date());
	      //messageDataSaved();
	    }).catch(err => {
	      //messageSaveError();
	      console.warn(err);
	    });
	  }).catch(err => {
	    console.log('Network requests have failed, this is expected if offline');
	    getLocalEventData()
	    .then(offlineData => {
	      if (!offlineData.length) {
	        //messageNoData();
	      } else {
	        //messageOffline();
	        updateUI(offlineData); 
	      }
	    });
	  });
	}

/* Network functions */
function getServerData() {
  return fetch('api/getAll').then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  });
}

function addAndPostEvent(e) {
  e.preventDefault();
  const data = {
    id: Date.now(),
    title: document.getElementById('title').value,
    note: document.getElementById('note').value
  };
  updateUI([data]);

  // TODO - save event data locally
  saveEventDataLocally([data]);
  const headers = new Headers({'Content-Type': 'application/json'});
  const body = JSON.stringify(data);
  return fetch('api/add', {
    method: 'POST',
    headers: headers,
    body: body
  });
}

/* UI functions */
function updateUI(events) {
  events.forEach(event => {
    const item =
      `<li class="card" id=${event.id}>
         <div class="card-text">
           <h2>${event.title}</h2>
           <p>${event.note}</p>
           
         </div>
         <div class="card-action">
    		<button type="submit" class="raised button ripple" onclick = "deleteData(${event.id})" >
    			Delete
    		</button>
    	</div>
       </li>`;
    
    container.insertAdjacentHTML('beforeend', item);
  });
}
function deleteData(id){
	document.getElementById(id).remove();
	const headers = new Headers({'Content-Type': 'application/json'});
	  //const body = JSON.stringify(data);
	  //const controlObject : any;
	
	const controlObject = {};
	controlObject.id = id;
		fetch('api/delete', {
	    method: 'POST',
	    headers: headers,
	    body: JSON.stringify(controlObject)
	  });
		if (!('indexedDB' in window)) {return null;}
		  return dbPromise.then(db => {
		    const tx = db.transaction('events', 'readwrite');
		    const store = tx.objectStore('events');
		    store.delete(id)
		  });
		 

}
/* Storage functions */
function getLastUpdated() {
  return localStorage.getItem('lastUpdated');
}
function setLastUpdated(date) {
  localStorage.setItem('lastUpdated', date);
}
