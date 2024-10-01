import './App.scss';
import Header from './features/header/Header';
import {
  BrowserRouter, Route, Routes
} from 'react-router-dom';
import Game from './features/game/Game';
import GameList from './features/game-list/GameList';
import { Fragment } from 'react';
import { UserProvider } from './context/userContext';
import { RegisterForm, LoginForm, ProfileForm, ResetPasswordForm } from './features/user/UserForms';
import AdminPage from './features/admin/AdminPage';
import CreditExchange from './features/credit-exchange/CreditExchange';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Fragment>
              <GameList />
            </Fragment>}></Route>
            <Route path="/play/:gameId" element={<Game />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/credit-exchange" element={<CreditExchange />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </div>
  );
}

export default App;