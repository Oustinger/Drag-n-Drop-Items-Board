const getActiveElementCoord = (state, cursorPositionX, cursorPositionY) => ({
    top: cursorPositionY - state.activeElementSizeByCursor.top,
    left: cursorPositionX - state.activeElementSizeByCursor.left,
    right: cursorPositionX + state.activeElementSizeByCursor.right,
    bottom: cursorPositionY + state.activeElementSizeByCursor.bottom,
});

const isElementInside = (elemCoord, parentElem) => {
    const parentElemCoord = parentElem.getBoundingClientRect();

    const isTopInside = elemCoord.top > parentElemCoord.top;
    const isLeftInside = elemCoord.left > parentElemCoord.left;
    const isRightInside = elemCoord.right < parentElemCoord.right;
    const isBottomInside = elemCoord.bottom < parentElemCoord.bottom;

    return isTopInside && isLeftInside && isRightInside && isBottomInside;
};

const isElementsClimb = (firstElemCoord, secondElem) => {
    const { top: fTop, left: fLeft, right: fRight, bottom: fBottom } = firstElemCoord;
    const { top: sTop, left: sLeft, right: sRight, bottom: sBottom } = secondElem.getBoundingClientRect();

    // !!! Данная проверка требует доработки, поэтому отключена !!!

    // // Схематично указал расположение первого элемента относительно второго
    //
    // // Сверху и снизу:
    // if (
    //     // ##
    //     // #
    //     (fLeft === sLeft ||
    //         //  #
    //         // ##
    //         fRight === sRight ||
    //         // ###
    //         //  #
    //         (fLeft < sLeft && sRight < fRight) ||
    //         // ##
    //         //  ##
    //         (fRight > sLeft && fLeft < sRight && fRight < sRight) ||
    //         //  ##
    //         // ##
    //         (fLeft < sRight && fLeft > sLeft && fRight > sRight)) &&
    //     (fBottom < sTop)
    // ) {
    //     return true;
    // }

    // // Слева и справа:
    // if (
    //     // #  #
    //     // #
    //     (fTop === sTop ||
    //         // #
    //         // #  #
    //         fBottom === sBottom ||
    //         // #
    //         // #  #
    //         // #
    //         (fTop < sTop && sBottom < fBottom) ||
    //         // #
    //         // #  #
    //         //    #
    //         (fBottom > sTop && fTop < sTop && fBottom < sBottom) ||
    //         //    #
    //         // #  #
    //         // #
    //         (fTop < sBottom && fTop > sTop && fBottom > sBottom)) &&
    //     (fRight > sLeft)
    // ) {
    //     return true;
    // }

    return false;
};

const getElementXYByParentInPercent = (elemCoord, parentElem) => {
    const parentElemCoord = parentElem.getBoundingClientRect();

    return {
        x: ((elemCoord.left - parentElemCoord.left) * 100) / parentElemCoord.width,
        y: ((elemCoord.top - parentElemCoord.top) * 100) / parentElemCoord.height,
    };
};

function cleanBoardItem(elem) {
    elem.classList.remove('board__item');
    elem.style.top = 0;
    elem.style.left = 0;
}

const subscribeBoardElement = (state, boardElement) => {
    boardElement.addEventListener(`dragover`, (evt) => {
        // Разрешаем сбрасывать элементы в эту область
        evt.preventDefault();
    });

    boardElement.addEventListener(`drop`, (evt) => {
        // Находим перемещаемый элемент
        const activeElement = document.querySelector(`.selected`);
        // Находим элемент, над которым в данный момент находится курсор
        const currentElement = evt.target;

        // Проверяем, что событие произошло над доской,
        // иначе выходим
        if (!currentElement.classList.contains(`board`)) return;

        const activeElementCoord = getActiveElementCoord(state, evt.clientX, evt.clientY);
        const boardElements = [...currentElement.querySelectorAll('.board__item')];
        // Проверяем, что элемент:
        const isPlaceable =
            // 1. Находится внутри доски
            isElementInside(activeElementCoord, currentElement) &&
            // 2. Не залезает на другой элемент
            !boardElements.map((elem) => isElementsClimb(activeElementCoord, elem)).find((isClimb) => isClimb);

        if (!isPlaceable) return;

        const id = activeElement.dataset.id;
        const { x: xPercent, y: yPercent } = getElementXYByParentInPercent(activeElementCoord, currentElement);

        // Обновляем boardState
        state.boardState[id] = { x: xPercent, y: yPercent };

        // Размещаем элемент на доске
        activeElement.classList.add('board__item');
        activeElement.style.top = `${yPercent}%`;
        activeElement.style.left = `${xPercent}%`;
        currentElement.appendChild(activeElement);
    });
};
