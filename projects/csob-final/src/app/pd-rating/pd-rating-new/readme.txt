<!--<pre>
	  -- manually inserted result of pd-rating --
	  UC0421
	  > read pdmodel of selected party
		 3: Systém vyhledá na záznamu "Party" daného klienta PD model a doplní ho na zobrazenou obrazovku do pole "PD model". Pokud PD model na "Party" není, pak pole zůstane prázdné.
		 4: Systém vyhledá v konfiguraci pro daný PD model typ požadovaného ratingu (externí/interní) a na základě nalezeného typu ratingu
			umožní editaci polí "PD Rating", "Navržený rating", "Důvod overrullingu" a "Komentář" nebo pole "Rating".
			Pokud není PD model vyplněn, jsou editační všechna uvedená pole.
		 5: Uživatel vyplní "Výpočet ke dni", Rating nebo PD rating,
			případně "Navržený" PD rating, důvod overrullingu a komentář

	  input : (date)
	  pd-model (statictext)
	if (... data from server/configuration)
	  computed result (textbox) proposed (textbox) overruling (combo) comment (textarea)
	else
	  rating (textbox)

		[finish] will save data and go to detail with id


	TODO: jak vznikaji zaznamy typu
	Navržený PD rating
	Navržený PD rating Advisorem
	Schválený PD rating
	Finálně schválený PD rating
	?
	Záložka "Výsledky pdratingu" je velmi podobná, možná dojde k reuse?

</pre>-->
