const state = {
    activeElementSizeByCursor: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    boardState: {},
};

const importBoardState = () => {
    function createFile() {
        return new Blob([JSON.stringify(state.boardState, null, 2)], { type: 'application/json;charset=utf-8' });
    }

    function downloadFile(file) {
        var url = URL.createObjectURL(file);
        var elem = document.createElement('a');
        elem.href = url;
        elem.download = `boardState_${Date.now()}`;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    var file = createFile();
    downloadFile(file);
};

const replaceChildToBoard = (boardItems) => {
    const itemsListElement = document.querySelector('.items__list');

    const boardElement = document.querySelector('.board');
    const boardElements = [...boardElement.querySelectorAll('.board__item')];

    // Переносим всё в список предметов
    boardElements
        .map((elem) => {
            cleanBoardItem(elem);
            return elem;
        })
        .forEach((elem) => itemsListElement.appendChild(elem));

    // Переносим необходимые предметы обратно, согласно новому state
    const itemsListElements = [...itemsListElement.querySelectorAll('.items__item')];
    itemsListElements
        .filter((elem) => !!boardItems[elem.dataset.id])
        .map((elem) => {
            const elemItemCoord = boardItems[elem.dataset.id];

            elem.classList.add('board__item');
            elem.style.top = `${elemItemCoord.y}%`;
            elem.style.left = `${elemItemCoord.x}%`;

            return elem;
        })
        .forEach((elem) => boardElement.appendChild(elem));
};

const exportBoardState = async function () {
    const file = this.files[this.files.length - 1];

    try {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
            state.boardState = JSON.parse(event.target.result);
            replaceChildToBoard(state.boardState);
        };
        await fileReader.readAsText(file);
    } catch (e) {
        throw new Error(e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const itemsListElement = document.querySelector(`.items__list`);
    const itemElements = itemsListElement.querySelectorAll(`.items__item`);

    // Перебираем все элементы списка и присваиваем нужное значение
    for (const item of itemElements) {
        item.draggable = true;

        item.addEventListener('mousedown', (evt) => {
            const itemCoord = item.getBoundingClientRect();

            state.activeElementSizeByCursor = {
                top: evt.offsetY,
                left: evt.offsetX,
                right: itemCoord.width - evt.offsetX,
                bottom: itemCoord.height - evt.offsetY,
            };
        });

        // Отключаем "переносимость" у картинок
        item.querySelector('.items__item-img').draggable = false;
    }

    itemsListElement.addEventListener(`dragstart`, (evt) => {
        evt.target.classList.add(`selected`);
    });

    itemsListElement.addEventListener(`dragend`, (evt) => {
        evt.target.classList.remove(`selected`);
    });

    subscribeItemsListElement(state, itemsListElement);

    const boardElement = document.querySelector('.board');

    boardElement.addEventListener(`dragstart`, (evt) => {
        evt.target.classList.add(`selected`);
    });

    boardElement.addEventListener(`dragend`, (evt) => {
        evt.target.classList.remove(`selected`);
    });

    subscribeBoardElement(state, boardElement, itemsListElement);

    // Импорт board state в файл
    document.querySelector('.control__button.import').addEventListener('click', importBoardState);

    // Экспорт board state из файла
    document.querySelector('#export-input').addEventListener('change', exportBoardState);
});

