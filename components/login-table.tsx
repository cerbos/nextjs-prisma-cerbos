const LoginTable = () => {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>alice</td>
            <td>supersecret</td>
            <td>admin</td>
            <td>IT</td>
          </tr>
          <tr>
            <td>john</td>
            <td>password1234</td>
            <td>user</td>
            <td>Sales</td>
          </tr>
          <tr>
            <td>sarah</td>
            <td>asdfghjkl</td>
            <td>user</td>
            <td>Sales</td>
          </tr>
          <tr>
            <td>geri</td>
            <td>pwd123</td>
            <td>user</td>
            <td>Marketing</td>
          </tr>
        </tbody>
      </table>
      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
        }
      `}</style>
    </>
  )
}

export default LoginTable
