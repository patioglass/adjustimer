import { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import TermsOfUse from './components/TermsOfUse';
import Policy from './components/Policy';

const App =  (): ReactElement => {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/terms-of-use' element={<TermsOfUse/>} />
      <Route path='/privacy-policy' element={<Policy/>} />
    </Routes>
  );
}

export default App;