/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill, { checkFileExtension } from '../containers/NewBill.js';
import Router from '../app/Router.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store.js';
import BillsUI from '../views/BillsUI.js';

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
  describe('When I am on NewBill Page and I select an image in a correct format', () => {
    test('Then the input file should display the file name', () => {
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

      //DOM simulation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // initialisation NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      //element declaration
      const fileInput = screen.getByTestId('file');
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      fileInput.addEventListener('change', handleChangeFile);
      //instantiate a File object
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['image.png'], 'image.png', {
              type: 'image/png',
            }),
          ],
        },
      });
      expect(fileInput.files[0].name).toBe('image.png');
      expect(handleChangeFile).toHaveBeenCalled();
    }); //end test
  }); //end describe
}); //end describe

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page and I select an image in an incorrect format', () => {
    test('Then an error message should be displayed', () => {
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

      //DOM simulation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // initialisation NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      //element declaration
      const fileInput = screen.getByTestId('file');
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      fileInput.addEventListener('change', handleChangeFile);
      //instantiate a File object
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['image.txt'], 'image.txt', {
              type: 'image/txt',
            }),
          ],
        },
      });
      //tests
      expect(fileInput.files[0].name).toBe('image.txt');
      const errorInput = screen.getByTestId('errorMessage');
      expect(errorInput.textContent).toBe(
        'formats autorisés : .jpeg, .jpg, .png'
      );
      expect(handleChangeFile).toHaveBeenCalled();
    }); //end test
  }); //end describe
}); //end describe

describe('Given I am connected as an employee', () => {
  describe('When I submit a new bill', () => {
    test('then a bill is created', () => {
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

      //DOM simulation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // initialisation NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      //element declaration
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const submit = screen.getByTestId('form-new-bill');
      submit.addEventListener('submit', handleSubmit);
      fireEvent.submit(submit);
      expect(handleSubmit).toHaveBeenCalled();
    }); //test
  }); //end describe
}); //end describe

//POST Integration test
describe('Given I am connected as an employee', () => {
  describe('When I submit a new bill', () => {
    test('fetches bills from mock API POST', async () => {
      //mock function to track calls to mocked store
      const postSpy = jest.spyOn(mockStore, 'bills');
      //call POST function
      const billIsCreated = await postSpy().update();
      //tests
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(billIsCreated.id).toBe('47qAXb6fIm2zOKkLzMro');
    }); //end Test

    test('fetches bills from mock API POST and fails with 404 message error', async () => {

      //DOM simulation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // initialisation NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      //error simulation
      const mockedError = jest
        .spyOn(mockStore, 'bills')
        .mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error('Erreur 404'));
            },
          };
        });

      await expect(mockedError().update).rejects.toThrow('Erreur 404');
      expect(mockedError).toHaveBeenCalledTimes(2);
      expect(newBill.billId).toBeNull();
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    }); //end Test

    test('fetches bills from mock API POST and fails with 500 message error', async () => {
      //DOM simulation
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // initialisation NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      //error simulation
      const mockedError = jest
        .spyOn(mockStore, 'bills')
        .mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error('Erreur 500'));
            },
          };
        });

      await expect(mockedError().update).rejects.toThrow('Erreur 500');
      expect(mockedError).toHaveBeenCalledTimes(3);
      expect(newBill.billId).toBeNull();
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    }); //end Test
  }); //end describe
}); //end describe
