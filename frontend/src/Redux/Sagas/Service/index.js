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