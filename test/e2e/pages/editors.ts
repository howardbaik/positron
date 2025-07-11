/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2024 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import test, { expect } from '@playwright/test';
import { Code } from '../infra/code';


export class Editors {

	activeEditor = this.code.driver.page.locator('div.tab.tab-actions-right.active.selected');
	editorIcon = this.code.driver.page.locator('.monaco-icon-label.file-icon');
	editorPart = this.code.driver.page.locator('.split-view-view .part.editor');
	suggestionList = this.code.driver.page.locator('.suggest-widget .monaco-list-row');

	constructor(private code: Code) { }

	async clickTab(tabName: string): Promise<void> {
		await test.step(`Click tab: ${tabName}`, async () => {
			const tabLocator = this.code.driver.page.getByRole('tab', { name: tabName });
			await expect(tabLocator).toBeVisible();
			await tabLocator.click();
		});
	}

	async verifyTab(
		tabName: string,
		{ isVisible = true, isSelected = true }: { isVisible?: boolean; isSelected?: boolean }
	): Promise<void> {
		await test.step(`Verify tab: ${tabName} is ${isVisible ? '' : 'not'} visible, is ${isSelected ? '' : 'not'} selected`, async () => {
			const tabLocator = this.code.driver.page.getByRole('tab', { name: tabName });

			await (isVisible
				? expect(tabLocator).toBeVisible()
				: expect(tabLocator).not.toBeVisible());

			await (isSelected
				? expect(tabLocator).toHaveClass(/selected/)
				: expect(tabLocator).not.toHaveClass(/selected/));
		});
	}

	async waitForActiveTab(fileName: string, isDirty: boolean = false): Promise<void> {
		await expect(this.code.driver.page.locator(`.tabs-container div.tab.active${isDirty ? '.dirty' : ''}[aria-selected="true"][data-resource-name$="${fileName}"]`)).toBeVisible();
	}

	async waitForActiveTabNotDirty(fileName: string): Promise<void> {
		await expect(
			this.code.driver.page.locator(
				`.tabs-container div.tab.active:not(.dirty)[aria-selected="true"][data-resource-name$="${fileName}"]`
			)
		).toBeVisible();
	}

	async newUntitledFile(): Promise<void> {
		if (process.platform === 'darwin') {
			await this.code.driver.page.keyboard.press('Meta+N');
		} else {
			await this.code.driver.page.keyboard.press('Control+N');
		}

		await this.waitForEditorFocus('Untitled-1');
	}

	async waitForEditorFocus(fileName: string): Promise<void> {
		await this.waitForActiveTab(fileName, undefined);
		await this.waitForActiveEditor(fileName);
	}

	async waitForActiveEditor(fileName: string): Promise<any> {
		const selector = `.editor-instance .monaco-editor[data-uri$="${fileName}"] textarea`;
		await expect(this.code.driver.page.locator(selector)).toBeFocused();
	}

	async selectTab(fileName: string): Promise<void> {

		// Selecting a tab and making an editor have keyboard focus
		// is critical to almost every test. As such, we try our
		// best to retry this task in case some other component steals
		// focus away from the editor while we attempt to get focus

		await expect(async () => {
			await this.code.driver.page.locator(`.tabs-container div.tab[data-resource-name$="${fileName}"]`).click();
			await this.code.driver.page.keyboard.press(process.platform === 'darwin' ? 'Meta+1' : 'Control+1'); // make editor really active if click failed somehow
			await this.waitForEditorFocus(fileName);
		}).toPass();
	}

	async waitForTab(fileName: string, isDirty: boolean = false): Promise<void> {
		await expect(this.code.driver.page.locator(`.tabs-container div.tab${isDirty ? '.dirty' : ''}[data-resource-name$="${fileName}"]`)).toBeVisible();
	}

	async waitForSCMTab(fileName: string): Promise<void> {
		await expect(this.code.driver.page.locator(`.tabs-container div.tab[aria-label^="${fileName}"]`)).toBeVisible();
	}

	async saveOpenedFile(): Promise<any> {
		if (process.platform === 'darwin') {
			await this.code.driver.page.keyboard.press('Meta+S');
		} else {
			await this.code.driver.page.keyboard.press('Control+S');
		}
	}

	async expectSuggestionListCount(count: number): Promise<void> {
		await test.step(`Expect editor suggestion list to have ${count} items`, async () => {
			await expect(this.suggestionList).toHaveCount(count);
		});
	}

	/**
	 * Verify: editor contains the specified text
	 * @param text The text to check in the editor
	 */
	async expectEditorToContain(text: string): Promise<void> {
		await test.step(`Verify editor contains: ${text}`, async () => {
			await expect(this.code.driver.page.locator('[id="workbench.parts.editor"]').getByRole('code').getByText(text)).toBeVisible();
		});
	}

	async expectActiveEditorIconClassToMatch(iconClass: RegExp): Promise<void> {
		await test.step(`Expect active editor icon to match: ${iconClass}`, async () => {
			await expect(this.activeEditor.locator(this.editorIcon)).toHaveClass(iconClass);
		});
	}
}
