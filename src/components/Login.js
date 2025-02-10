import React, { useState } from 'react';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const correctPassword = '666'; // 请替换成你的密码

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === correctPassword) {
      console.log("密码正确"); // 调试信息
      onLogin();
    } else {
      alert('密码错误');
    }
  };

  return (
    <div className="login">
      <h2>请输入密码</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
        />
        <button type="submit">登录</button>
      </form>
    </div>
  );
}

export default Login;