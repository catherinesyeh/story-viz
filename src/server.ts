import axios from "axios";

export const dataServerUrl = "http://127.0.0.1:5000";

function get(field: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${dataServerUrl}/` + field;
    axios
      .get(url)
      .then((response: any) => {
        console.log("promise resolve: " + field, response);
        resolve(response.data);
      })
      .catch((errResponse: any) => {
        console.log("promise reject: " + field);
        reject(errResponse);
      });
  });
}

function post(field: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${dataServerUrl}/` + field;
    axios
      .post(url, payload)
      .then((response: any) => {
        console.log("promise resolve: " + field, response);
        resolve(response.data);
      })
      .catch((errResponse: any) => {
        console.log("promise reject: " + field);
        reject(errResponse);
      });
  });
}

export async function getNewColors(
  data: any,
  color_desc: string,
  type: string
) {
  const payload = {
    data: data,
    color_desc: color_desc,
    story_type: type,
  };

  return post(`new_colors`, payload);
}

export async function getNewYAxis(data: any, yaxis_desc: string, type: string) {
  const payload = {
    data: data,
    yaxis_desc: yaxis_desc,
    story_type: type,
  };

  return post(`new_yaxis`, payload);
}

export async function checkBackendStatus() {
  return get("status");
}
