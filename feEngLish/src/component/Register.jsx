import "../css/auth.css";
export default function Register() {
  return (
    <>
      <div class="login-page">
        {" "}
        <main>
          <header>
            <h1>Sign up</h1>
          </header>
          <form action="/register" method="POST">
            <label for="fullname">Email:</label>
            <input type="email" name="fullname" required />
            <label for="fullname">NumberPhone:</label>
            <input type="number" name="number" required />
            <br />
            <label for="username">Username:</label>
            <input type="text" name="username" required />
            <br />
            <label for="password">Password:</label>
            <input type="password" name="password" required />
            <br />
            <button type="submit">Register</button>
          </form>
          <br />
          <a href="#">← Turn login</a>
        </main>
      </div>
    </>
  );
}
