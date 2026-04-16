const formData = new FormData();
formData.append("name", "Test");
formData.append("last_name", "Test");
formData.append("email", "test@test.com");
formData.append("country", "AR");

fetch("https://grandpick-production.up.railway.app/api/users/689ea0d2eae013f46976e868", {
  method: "PATCH",
  body: formData
})
.then(async res => {
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
})
.catch(err => console.error(err));
