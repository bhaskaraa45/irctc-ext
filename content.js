function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        let elapsedTime = 0;
        const intervalTime = 500;

        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            } else if (elapsedTime >= timeout) {
                clearInterval(interval);
                reject(new Error("Element not found: " + selector));
            }
            elapsedTime += intervalTime;
        }, intervalTime);
    });
}

function waitForArrayElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        let elapsedTime = 0;
        const intervalTime = 500;

        const interval = setInterval(() => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                clearInterval(interval);
                resolve(Array.from(elements)); // Return as an array
            } else if (elapsedTime >= timeout) {
                clearInterval(interval);
                reject(new Error("Elements not found: " + selector));
            }
            elapsedTime += intervalTime;
        }, intervalTime);
    });
}

function fillStationInput(selector, stationValue, listSelector, listItemClass) {
    return waitForElement(selector).then((inputElement) => {
        inputElement.focus();
        inputElement.dispatchEvent(new Event('focus', { bubbles: true }));

        inputElement.value = '';

        stationValue.split('').forEach((char) => {
            inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
            inputElement.value += char;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
        });

        inputElement.dispatchEvent(new Event('change', { bubbles: true }));

        return waitForElement(listSelector).then((listElement) => {
            const firstItem = listElement.querySelector(`li.${listItemClass}`);
            if (firstItem) {
                firstItem.click();
                console.log('First suggestion selected: ', firstItem.innerText);
            }
        });
    });
}

function selectTatkal() {
    return waitForElement('p-dropdown[formcontrolname="journeyQuota"] .ui-dropdown-trigger').then((dropdownTrigger) => {
        dropdownTrigger.click();

        return waitForElement('.ui-dropdown-items').then((dropdownList) => {
            const tatkalOption = Array.from(dropdownList.querySelectorAll('li')).find(option => option.innerText.includes('TATKAL'));
            if (tatkalOption) {
                tatkalOption.click();
                console.log('Tatkal option selected.');
            } else {
                console.log('Tatkal option not found.');
            }
        });
    });
}

function getDatePlusOne() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.getDate();
}

function selectDateFromCalendar() {
    const targetDay = getDatePlusOne();

    return waitForElement('p-calendar[formcontrolname="journeyDate"] input.ui-inputtext').then((calendarInput) => {
        calendarInput.click();

        return waitForElement('.ui-datepicker-calendar').then((calendarTable) => {
            const dayElement = Array.from(calendarTable.querySelectorAll('a.ui-state-default')).find(el => el.textContent === String(targetDay));
            if (dayElement) {
                dayElement.click();
                console.log('Date selected: ', targetDay);
            } else {
                console.log('Target date not found in the current month view.');
            }
        });
    });
}

function login() {
    return new Promise((resolve, reject) => {
        // Retrieve stored username and password from browser's local storage
        browser.storage.local.get(['username', 'password']).then((result) => {

            // Use default values if not found in storage
            const username = result.username || '';
            const password = result.password || '1234567890';

            // Wait for the login button to appear and click it
            waitForElement('.search_btn.loginText.ng-star-inserted').then((loginButton) => {
                loginButton.click();

                // Wait for the userId input field (by formControlName) to appear and fill it
                waitForElement('input[formcontrolname="userid"]').then((userNameInput) => {
                    userNameInput.focus();
                    userNameInput.value = username;

                    // Dispatch events to simulate actual user input
                    userNameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    userNameInput.dispatchEvent(new Event('change', { bubbles: true }));

                    // Wait for the password input field (by formControlName) to appear and fill it
                    return waitForElement('input[formcontrolname="password"]');
                }).then((passwordInput) => {
                    passwordInput.focus();
                    passwordInput.value = password;

                    // Dispatch events to simulate actual user input
                    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

                    // Optionally, handle the captcha input field here
                    return waitForElement('input[formcontrolname="captcha"]');
                }).then((captchaInput) => {
                    captchaInput.focus();
                    console.log('Captcha input field found, waiting for user input...');

                    // Optionally wait for captcha input by the user or resolve the promise
                    resolve('Login form filled successfully, waiting for captcha input.');
                }).catch((error) => {
                    console.error("Error during login process:", error);
                    reject(error); // Reject the promise if any step fails
                });
            }).catch((error) => {
                console.error("Login button not found:", error);
                reject(error); // Reject if login button is not found
            });
        }).catch((error) => {
            console.error("Error retrieving username or password:", error);
            reject(error); // Reject if there’s an error with retrieving credentials
        });
    });
}

// Call the appropriate functions based on the current page
function handleTrainSearchPage() {
    console.log("Handling Train Search Page");

    browser.storage.local.get(['fromStation', 'toStation']).then((result) => {
        const fromStation = result.fromStation || 'SECUNDERABAD';
        const toStation = result.toStation || 'HOWRAH';

        console.log(`fromStation: ${fromStation}`);
        console.log(`toStation: ${toStation}`);

        if (fromStation && toStation) {
            fillStationInput(
                '.ng-tns-c57-8.ui-inputtext.ui-widget.ui-state-default.ui-corner-all.ui-autocomplete-input.ng-star-inserted',
                fromStation,
                '.ui-autocomplete-items.ui-autocomplete-list.ui-widget-content.ui-widget.ui-corner-all.ui-helper-reset.ng-tns-c57-8',
                'ng-tns-c57-8.ng-star-inserted.ui-autocomplete-list-item.ui-corner-all'
            ).then(() => {
                fillStationInput(
                    '.ng-tns-c57-9.ui-inputtext.ui-widget.ui-state-default.ui-corner-all.ui-autocomplete-input.ng-star-inserted',
                    toStation,
                    '.ui-autocomplete-items.ui-autocomplete-list.ui-widget-content.ui-widget.ui-corner-all.ui-helper-reset.ng-tns-c57-9',
                    'ng-tns-c57-9.ng-star-inserted.ui-autocomplete-list-item.ui-corner-all'
                ).then(() => {
                    selectDateFromCalendar().then(() => {
                        selectTatkal().then(() => {
                            waitForElement('button[type="submit"]').then((searchButton) => {
                                searchButton.click();
                                waitForPageLoad(() => {
                                    handlePageChange();
                                });
                            });
                        });
                    });
                });
            });
        }
    });
}

function waitForPageLoad(callback) {
    let lastHref = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastHref) {
            lastHref = window.location.href;
            console.log("Page navigation detected. New URL:", lastHref);

            observer.disconnect();
            callback();
        }
    });

    observer.observe(document, { childList: true, subtree: true });
}

function waitForElementToDisappear(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const intervalTime = 500;
        let elapsedTime = 0;

        const interval = setInterval(() => {
            const element = document.querySelector(selector);

            if (!element) {
                clearInterval(interval);
                resolve();
            } else if (elapsedTime >= timeout) {
                clearInterval(interval);
                reject(new Error("Element did not disappear within the timeout period: " + selector));
            }
            elapsedTime += intervalTime;
        }, intervalTime);
    });
}

function selectTrainByNumber(trainNumber, seatType = 'AC 3 Economy (3E)') {
    console.log("Selecting train:", trainNumber);

    waitForArrayElement('.form-group.no-pad.col-xs-12.bull-back.border-all').then((trainList) => {
        console.log("Found train elements:", trainList);

        const targetTrainElement = trainList.find((trainEl) => {
            const trainHeading = trainEl.querySelector('.train-heading strong');
            return trainHeading && trainHeading.textContent.trim().includes(trainNumber);
        });

        if (targetTrainElement) {
            console.log("Train found:", targetTrainElement.querySelector('.train-heading strong').textContent.trim());

            const parentDiv = targetTrainElement;

            console.log('Parent Div:', parentDiv);

            const acAvailabilitySection = Array.from(parentDiv.querySelectorAll('strong'))
                .find(strong => strong.textContent.includes(seatType));

            console.log('AC Availability Section:', acAvailabilitySection);

            if (acAvailabilitySection) {
                console.log(seatType + "section found.");

                const refreshButton = acAvailabilitySection.closest('.pre-avl').querySelector('.fa.fa-repeat');

                console.log('Refresh Button:', refreshButton);

                if (refreshButton) {
                    console.log("Clicking 'Refresh' button for availability.");
                    refreshButton.click();

                    // Wait dynamically for the loading screen to disappear
                    waitForElementToDisappear('.my-loading').then(() => {
                        const availableSeatsElement = parentDiv.querySelector('.AVAILABLE.col-xs-12');
                        // const availableSeatsElement = parentDiv.querySelector('.WL.col-xs-12');

                        console.log(availableSeatsElement);

                        if (availableSeatsElement) {
                            console.log("Available seats found. Clicking on the seat option.");
                            availableSeatsElement.click();

                            const bookNowButton = parentDiv.querySelector('.btnDefault.train_Search');

                            if (bookNowButton) {
                                console.log("Clicking 'Book Now' button.");
                                bookNowButton.click();

                                waitForPageLoad(() => {
                                    handlePageChange();
                                });

                            } else {
                                console.log("'Book Now' button not found.");
                            }
                        } else {
                            console.log("No available seats found.");
                        }
                    }).catch((error) => {
                        console.error("Error waiting for loading screen to disappear:", error);
                    });
                } else {
                    console.log("Refresh button not found");
                }
            } else {
                console.log(" section not found for train:", trainNumber);
            }
        } else {
            console.log("Train with number", trainNumber, "not found.");
        }
    }).catch(error => {
        console.error("Error selecting train:", error);
    });
}

function fillPassengerNameUsingAttributes(placeholderText, inputType, role, name) {
    const selector = `input[placeholder="${placeholderText}"][type="${inputType}"][role="${role}"]`;

    return new Promise((resolve, reject) => {
        waitForElement(selector).then((inputElement) => {
            console.log("Passenger name input field found.");

            inputElement.focus();
            inputElement.dispatchEvent(new Event('focus', { bubbles: true }));

            inputElement.value = '';

            name.split('').forEach((char) => {
                inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
                inputElement.value += char;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
            });

            inputElement.dispatchEvent(new Event('change', { bubbles: true }));

            console.log("Name entered: ", name);

            waitForElement('.ui-autocomplete-items').then((listElement) => {
                const firstOption = listElement.querySelector('li');

                if (firstOption) {
                    console.log("Selecting the first suggested option:", firstOption.innerText);
                    firstOption.click();
                    resolve(); // Resolve the promise after selecting the option
                } else {
                    console.log("No suggestions found.");
                    resolve(); // Still resolve to continue the chain even if no suggestions
                }
            }).catch((error) => {
                console.error("Error waiting for the suggestion list:", error);
                reject(error); // Reject the promise on error
            });
        }).catch((error) => {
            console.error("Error finding the input field:", error);
            reject(error); // Reject the promise on error
        });
    });
}

function selectPaymentMethodByLabel(forValue, labelText) {
    return new Promise((resolve, reject) => {
        waitForElement(`label[for="${forValue}"]`).then((labelElement) => {
            if (labelElement && labelElement.textContent.includes(labelText)) {
                const radioButton = labelElement.querySelector('input[type="radio"]');
                if (radioButton) {
                    radioButton.click();
                    console.log(`Selected payment method: ${labelText}`);
                    resolve(); // Resolve after selecting the payment method
                } else {
                    console.error("Radio button not found.");
                    reject("Radio button not found."); // Reject the promise if the radio button is not found
                }
            } else {
                console.error("Label text does not match or label not found.");
                reject("Label text does not match or label not found."); // Reject the promise if the label is incorrect
            }
        }).catch((error) => {
            console.error("Error finding the label for the payment method:", error);
            reject(error); // Reject the promise on error
        });
    });
}

async function dataFilling() {
    const result = await browser.storage.local.get('fullName');
    fillPassengerNameUsingAttributes('Passenger Name', 'text', 'searchbox', result.fullName)
        .then(() => {
            return selectPaymentMethodByLabel("2", "Pay through BHIM/UPI");
        })
        .then(() => {
            return waitForElement('button[type="submit"]');
        })
        .then((submitButton) => {
            console.log("Clicking the Submit button...");
            submitButton.click();
            waitForPageLoad(() => {
                handlePageChange();
            });
        })
        .catch((error) => {
            console.error("Error during data filling:", error);
        });
}

(function () {
    window.addEventListener("load", () => {
        handlePageChange();

        window.addEventListener("popstate", handlePageChange);
        window.addEventListener("hashchange", handlePageChange);
    });
})();

// Function to detect page changes
async function handlePageChange() {
    console.log(window.location.href);

    if (window.location.href.includes("train-search")) {
        login().then(async () => {
            const result = await browser.storage.local.get('executionTime');
            const executionTime = result.executionTime || "10:00";

            const now = new Date();
            const targetTime = new Date();

            const [hours, minutes] = executionTime.split(":");
            targetTime.setHours(hours, minutes, 2, 0);

            let timeDifference = targetTime.getTime() - now.getTime();

            if (timeDifference < 0) {
                targetTime.setDate(targetTime.getDate() + 1);
                timeDifference = targetTime.getTime() - now.getTime();
            }

            console.log(`Waiting for ${timeDifference / 1000} seconds until execution...`);

            setTimeout(() => {
                handleTrainSearchPage();
            }, timeDifference);
        }).catch(error => {
            console.error("Login failed:", error);
        });
    } else if (window.location.href.includes("booking/train-list")) {
        const result = await browser.storage.local.get(['trainNumber', 'seatType']);
        selectTrainByNumber(result.trainNumber || '12704', result.seatType || null );
    } else if (window.location.href.includes("/psgninput")) {
        dataFilling();
    }
}
