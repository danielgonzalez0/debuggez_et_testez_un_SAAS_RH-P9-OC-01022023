/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import mockStore from '../__mocks__/store.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');

      //to-do write expect expression
      expect(windowIcon.getAttribute('class')).toContain('active-icon');
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe('Given I am connected as an employee and I am on bills page', () => {
  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      //start DOM simulation
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const bill = new Bills({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });

      //end DOM simulation
      //start eventlistener simulation
      // mock bootstrap jQuery modal function
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(bill.handleClickIconEye);
      const iconEye = screen.getAllByTestId('icon-eye');
      const modale = document.getElementById('modaleFile');
      iconEye.forEach((icon) => {
        icon.addEventListener('click', () => handleClickIconEye(icon));
        userEvent.click(icon);
        //tests
        expect(handleClickIconEye).toHaveBeenCalled();
        expect(modale).toBeTruthy();
      });
      //end eventlistener simulation
    }); //end test
  }); //end describe
}); //end describe

describe('Given I am connected as an employee and I am on bills page', () => {
  describe('When I click on the new bill button', () => {
    test('I should be sent on the page name sent a bill', () => {
      //environment simulation
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
//       //start DOM simulation
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const bill = new Bills({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });

 //element declaration
      const newButton = screen.getByTestId('btn-new-bill');
      const handleClickNewBill = jest.fn(bill.handleClickNewBill());
//event simulation
      newButton.addEventListener('click', handleClickNewBill);
      fireEvent.click(newButton);
//tests
      expect(handleClickNewBill).toHaveBeenCalled();
      const formNewBill = screen.getByTestId('form-new-bill');
      expect(formNewBill).toBeTruthy();
    }); //end test
  }); //end describe
}); //end describe

//GET integration test
describe('Given I am a user connected as Employee', () => {
  describe('When I navigate to the bills page', () => {
    test('fetches bills from mock API GET', async () => {
      //environment simulation
      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'a@a' })
      );
      //DOM simulation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      // router simulation
      const pathname = ROUTES_PATH['Bills'];
      root.innerHTML = ROUTES({ pathname: pathname, loading: true });
      const billsList = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      billsList.getBills().then((data) => {
        root.innerHTML = BillsUI({ data });
      //tests
      expect(pathname).toBe(`#employee/bills`);
      expect(screen.getByTestId('tbody').rows.length).toBe(4);
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy();
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
      });
    }); //end test
  }); //end describe

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      //environment simulation
      jest.spyOn(mockStore, 'bills');
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      );
      //DOM simulation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.appendChild(root);
      // router simulation
      router();
    }); //end beforeEach
    test('fetches bills from an API and fails with 404 message error', async () => {
      //https://jestjs.io/fr/docs/mock-function-api#mockfnmockimplementationoncefn
      //Error simulation
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });
      await new Promise(process.nextTick);
      //DOM simulation
      document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
      //test
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    }); //end test

    test('fetches messages from an API and fails with 500 message error', async () => {
      //error Simulation
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'));
          },
        };
      });
      await new Promise(process.nextTick);
      //DOM simulation
      document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
      //test
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    }); //end test
  }); //end describe
}); //end describe
