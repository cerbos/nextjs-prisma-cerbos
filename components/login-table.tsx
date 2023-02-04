import { users } from "../lib/idp";

const LoginTable = () => {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.username}>
              <td>{user.username}</td>
              <td>{user.password}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th,
        td {
          border: 1px solid #ccc;
          padding: 8px;
        }
      `}</style>
    </>
  );
};

export default LoginTable;
