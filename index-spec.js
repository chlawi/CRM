/**
 * Created by Chet.Williams on 1/28/2015.
 */
describe('L-Tron Inside', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:63342/L-TronInside/client/index.html');
  });

  it('is entitled "L-Tron Inside"', function () {
    expect(browser.getTitle()).toBe('L-Tron Inside')
  });

  it('has a "main" section"', function () {
    expect(element(by.tagName('section'))).toBeDefined();
    expect(element(by.id('main'))).toBeDefined();
  });

  it('loads the "home" view into the "main" section by default', function () {
    expect(browser.getCurrentUrl()).toEqual('http://localhost:63342/L-TronInside/client/index.html#/');
    expect(element(by.tagName('section')).getText()).toEqual('Home Page');
  });

  it('can navigate to /about', function () {
    browser.setLocation('/about');
    expect(browser.getCurrentUrl()).toEqual('http://localhost:63342/L-TronInside/client/index.html#/about');
    expect(element(by.tagName('section')).getText()).toEqual('About Page');
  });

  it('redirects invalid urls to "home"', function () {
    browser.setLocation('');
    expect(browser.getCurrentUrl()).toEqual('http://localhost:63342/L-TronInside/client/index.html#/');
    expect(element(by.tagName('section')).getText()).toEqual('Home Page');
  });
});