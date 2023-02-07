/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill, { checkFileExtension } from '../containers/NewBill.js';

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
  describe('When I am on NewBill Page', () => {
    test('Then ...', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });
  });
});
