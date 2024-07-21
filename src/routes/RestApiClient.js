
class RestApiClient {
  constructor(authToken = null) {
    this.authToken = authToken;
  }

  async get(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
    });
    const data = await response.json();
    return data;
  }

  async uploadMedia(url, file) {
    const response = await fetch(url, {
      method: "POST",
      body: file,
    });

    const data = await response.json();
    return data;
  }

  // async uploadMedia(url, file, type) {
  //   const response = await fetch(url, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: `Bearer ${this.authToken}`,
  //     },
  //     body: file,
  //   });

  //   const data = await response.json();
  //   return data;
  // }

  async post(url, data) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(data ?? {}),
    });
    const responseData = await response.json();
    return responseData;
  }

  async authPost(url, data) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data ?? {}),
    });
    const responseData = await response.json();
    return responseData;
  }

  async authPut(url, data) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data ?? {}),
    });
    const responseData = await response.json();
    return responseData;
  }

  async put(url, data) {
    let response;
    if (data) {
      response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(data ?? {}),
      });
    } else {
      response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
      });
    }
    const responseData = await response.json();
    return responseData;
  }

  async delete(url, data) {
    let response;
    if (data) {
      response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(data ?? {}),
      });
    } else {
      response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
      });
    }
    const responseData = await response.json();
    return responseData;
  }
}

export default RestApiClient;