/**
 * Created by Chet.Williams on 1/28/2015.
 */
describe('L-Tron Inside', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:63342/L-TronInside/client/index.html');
  });

  it('is entitled "L-Tron Inside"', function () {
    expect(browser.getTitle()).toBe('L-Tron Inside');
  });

  it('has a "main" section"', function () {
    expect(element(by.tagName('section'))).toBeDefined();
    expect(element(by.id('main'))).toBeDefined();
  });

  it('loads the "home" view into the "main" section by default', function () {
    expect(browser.getCurrentUrl()).toEqual('http://localhost:63342/L-TronInside/client/index.html#/l-tronInside/welcome');
    expect(element(by.tagName('h1')).getText()).toEqual('Welcome');
  });

  it('can navigate to about page', function () {
    browser.setLocation('l-tronInside/about');
    expect(browser.getCurrentUrl()).toEqual('http://localhost:63342/L-TronInside/client/index.html#/l-tronInside/about');
    expect(element(by.tagName('h1')).getText()).toEqual('About');
  });

  it('redirects invalid urls to "welcome"', function () {
    browser.setLocation('');
    expect(browser.getCurrentUrl()).toEqual('http://localhost:63342/L-TronInside/client/index.html#/l-tronInside/welcome');
    expect(element(by.tagName('h1')).getText()).toEqual('Welcome');
  });
});