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
        store,
        localStorage: window.localStorage,
      });

      //end DOM simulation
      //start eventlistener simulation
      // mock bootstrap jQuery modal function
      $.fn.modal = jest.fn();
      const iconEye = screen.getAllByTestId('icon-eye');
      const modale = document.getElementById('modaleFile');
      const handleClickIconEye = jest.fn(bill.handleClickIconEye);
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
      //start DOM simulation
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const bill = new Bills({
        document,
        onNavigate,
        store,
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
