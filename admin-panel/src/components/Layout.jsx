import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={styles.container}>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    padding: '20px',
  },
};

export default Layout; 