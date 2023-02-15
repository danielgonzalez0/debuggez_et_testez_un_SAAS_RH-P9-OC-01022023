/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill, { checkFileExtension } from '../containers/NewBill.js';
import Router from '../app/Router.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

//unit test
const validExtensionName = 'document1.jpg';
const invalidExtensionName = 'document2.svg';

describe('supporting document extension test unit suites ', () => {
  it('should be a valid extension file', () => {
    expect(checkFileExtension(validExtensionName)).toBe(true);
  });
  it('should be an invalid extension file', () => {
    expect(checkFileExtension(invalidExtensionName)).toBe(false);
  });
});

describe('Given I am connected as an employee', () => {
  describe('When I am on the new bill page', () => {
    test('Then email icon in vertical layout should be highlighted', async () => {
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
      //DOM simultation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);
      //test
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.getAttribute('class')).toContain('active-icon');
    }); //end test
  }); //end describe
}); //end describe

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then ...', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });
  });
});
