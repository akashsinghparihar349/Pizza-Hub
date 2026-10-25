//Create Record : use following code in case if payload doesn't have a file field
export async function createRecord(collection, payload) {
    try {
        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token") || import.meta.env.VITE_APP_JWT_PUBLIC_KEY
            },
            body: JSON.stringify({ ...payload })
        })
        response = await response.json()
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}

//Create Record : use following code in case if payload having a file field
export async function createMultipartRecord(collection, payload) {
    try {
        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}`, {
            method: "POST",
            headers: {
                "authorization": localStorage.getItem("token") || import.meta.env.VITE_APP_JWT_PUBLIC_KEY

            },
            body: payload
        })
        response = await response.json()
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}

//GET Record
export async function getRecord(collection) {
    try {
        let url = `${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}`
        if ((collection === "cart" || collection === "wishlist") || (collection === "checkout" && localStorage.getItem("role") === "Buyer"))
            url = `${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}/user/${localStorage.getItem("userid")}`

        let response = await fetch(url, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token") || import.meta.env.VITE_APP_JWT_PUBLIC_KEY
            }
        })
        response = await response.json()
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}

//Update Record : use following code in case if payload doesn't have a file field
export async function updateRecord(collection, payload) {
    try {
        let url = `${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}/${payload._id}`
        if (collection === "product") {
            url = `${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}/user/${payload._id}`
        }
        let response = await fetch(url, {
            method: "PUT",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token") || import.meta.env.VITE_APP_JWT_PUBLIC_KEY

            },
            body: JSON.stringify({ ...payload })
        })
        response = await response.json()
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}

//Update Record : use following code in case if payload having a file field
export async function updateMultipartRecord(collection, payload) {
    try {
        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}/${payload.get("_id")}`, {
            method: "PUT",
            headers: {
                "authorization": localStorage.getItem("token") || import.meta.env.VITE_APP_JWT_PUBLIC_KEY

            },
            body: payload
        })
        response = await response.json()
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}

//DELETE Record
export async function deleteRecord(collection, payload) {
    try {
        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/${collection}/${payload._id}`, {
            method: "DELETE",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token") || import.meta.env.VITE_APP_JWT_PUBLIC_KEY

            }
        })
        response = await response.json()
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}

// -------------------------------------------------------------
// DEDICATED MODULE SERVICE FUNCTIONS FOR COMPLETE AUDIT INTEGRATION
// -------------------------------------------------------------

const getHeaders = (isJson = true) => {
    const headers = {
        "authorization": localStorage.getItem("token") || import.meta.env.VITE_APP_JWT_PUBLIC_KEY
    }
    if (isJson) headers["content-type"] = "application/json"
    return headers
}

// 1. DASHBOARD
export async function getDashboardStatsApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/dashboard/stats`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 2. CUSTOMIZATION
export async function getCustomizationOptionsApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/customization`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function calculatePriceApi(payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/customization/calculate-price`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function seedCustomizationOptionsApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/customization/seed`, {
            method: "POST",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function createCustomizationOptionApi(payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/customization`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function updateCustomizationOptionApi(id, payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/customization/${id}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function deleteCustomizationOptionApi(id) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/customization/${id}`, {
            method: "DELETE",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 3. INVENTORY
export async function getInventoryApi(query = "") {
    try {
        const url = query ? `${import.meta.env.VITE_APP_BACKEND_SERVER}/inventory?${query}` : `${import.meta.env.VITE_APP_BACKEND_SERVER}/inventory`
        const res = await fetch(url, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function createInventoryApi(payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/inventory`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function updateInventoryApi(id, payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/inventory/${id}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function adjustInventoryApi(payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/inventory/adjust`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function checkInventoryAlertsApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/inventory/check-alerts`, {
            method: "POST",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function deleteInventoryApi(id) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/inventory/${id}`, {
            method: "DELETE",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 4. RESTAURANT PARTNERS
export async function applyRestaurantApi(payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/apply`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function getRestaurantsAdminApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function approveRestaurantApi(id) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/${id}/approve`, {
            method: "PUT",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function rejectRestaurantApi(id, reason) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/${id}/reject`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({ reason })
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function getMyRestaurantApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/me`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function updateMyRestaurantApi(payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/me`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function getMyRestaurantProductsApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/my-products`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function getMyRestaurantOrdersApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/my-orders`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function updateMyRestaurantOrderStatusApi(orderId, orderStatus) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/restaurant/order/${orderId}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({ orderStatus })
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 5. USER ADDRESS BOOK DEDICATED APIS
export async function getUserAddressesApi() {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/address`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function addUserAddressApi(payload) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/address`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(payload)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

export async function deleteUserAddressApi(index) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/address/${index}`, {
            method: "DELETE",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 6. USER EMAIL VERIFICATION
export async function verifyUserEmailApi(email, otp) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/verify-email`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ email, otp })
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 7. PRODUCT QUICK STOCK UPDATE
export async function updateProductStockApi(id, stock, stockQuantity) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/product/user/${id}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({ stock, stockQuantity })
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 8. BUYER ORDER CANCELLATION
export async function cancelOrderBuyerApi(orderId) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/checkout/${orderId}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({ orderStatus: "Cancelled" })
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}

// 9. NEWSLETTER UNSUBSCRIBE
export async function unsubscribeNewsletterApi(id) {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/newsletter/unsubscribe/${id}`, {
            method: "GET",
            headers: getHeaders(true)
        })
        return await res.json()
    } catch (e) {
        return { result: "Fail", reason: e.message }
    }
}