function searchData() {
    const searchType = document.getElementById("searchType").value;
    const searchQuery = document.getElementById("searchQuery").value.trim();
    const resultDataElement = document.getElementById("resultData");
    const resultTableBody = document.getElementById("resultTable").getElementsByTagName('tbody')[0];

    if (!searchQuery) {
        resultTableBody.innerHTML = '';
        document.getElementById('searchQuery').value = '';
        resultDataElement.textContent = "Por favor ingrese un valor para buscar.";
        return;
    }

    if (searchType === "nut" && searchQuery.length !==10 ) {
        resultTableBody.innerHTML = '';
        document.getElementById('searchQuery').value = '';
        resultDataElement.textContent = "El NUT debe tener 10 dígitos exactos";
        return;
    }

    resultDataElement.textContent = "Cargando resultados...";

    
    // Hacer una solicitud GET al servidor con los parámetros searchType y searchQuery
    fetch(`/buscar?searchType=${searchType}&searchQuery=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(data => {
            resultTableBody.innerHTML = '';


            // No se encontraron datos
            if (!data || data.length === 0) {
                if (searchType === "nombre") {
                    resultDataElement.textContent = `No se encontraron resultados para ${searchType}: ${searchQuery}. Si desea buscar en DATABOOK realice una búsqueda por cédula.`;
                    return;
                } else if (searchType === "nut") {
                    resultDataElement.textContent = "No se encontraron resultados en el JSON. Consultando API DATABOOK...";

                    
                    fetch(`http://localhost:3000/buscarAPI?nut=${encodeURIComponent(searchQuery)}`)
                        .then(response => response.json())
                        .then(apiData => {
                            console.log("Datos recibidos de la API:", apiData);

                            if (!apiData || !apiData.registros || !apiData.registros.socio_demografico) {
                                resultDataElement.textContent("No se encontraron datos en DATABOOK. Estructura incorrecta o vacía en apiData:", apiData);
                                return;
                            }

                            const socioDemografico = apiData.registros.socio_demografico;
                            
                            const rowElement = document.createElement("tr"); // Asegurar que esté definido

                            const nutCell = document.createElement("td");
                            nutCell.textContent = socioDemografico.nut || '';
                            rowElement.appendChild(nutCell);

                            const nameCell = document.createElement("td");
                            nameCell.textContent = socioDemografico.nombre || '';
                            rowElement.appendChild(nameCell);

                            const birthCell = document.createElement("td");
                            birthCell.textContent = socioDemografico.fecha_1 || '';
                            rowElement.appendChild(birthCell);

                            const actionCell = document.createElement("td");
                            const detailButton = document.createElement("button");
                            detailButton.textContent = "Detalle";
                            detailButton.onclick = function () {
                                showDetails(socioDemografico.nut);
                            };
                            actionCell.appendChild(detailButton);
                            rowElement.appendChild(actionCell);

                            resultTableBody.appendChild(rowElement);
                        })
                        .catch(error => {
                            resultDataElement.textContent = "Error al consultar API DATABOOK.", error;
                        });

                    resultDataElement.textContent = "Resultado del API DATABOOK...";
                    return;
                }
            }


            // Llenar la tabla con los resultados
            data.forEach(row => {
                const rowElement = document.createElement("tr");

                const nutCell = document.createElement("td");
                nutCell.textContent = row.socio_demografico.nut || '';
                rowElement.appendChild(nutCell);
                

                const nameCell = document.createElement("td");
                nameCell.textContent = row.socio_demografico.nombre || '';
                rowElement.appendChild(nameCell);

                const birthCell = document.createElement("td");
                birthCell.textContent = row.socio_demografico.fecha_1 || '';
                rowElement.appendChild(birthCell);

                const actionCell = document.createElement("td");
                const detailButton = document.createElement("button");
                detailButton.textContent = "Detalle";
                detailButton.onclick = function () {
                    showDetails(row.socio_demografico.nut);
                };
                actionCell.appendChild(detailButton);
                rowElement.appendChild(actionCell);

                resultTableBody.appendChild(rowElement);
            });

            resultDataElement.textContent = "Datos encontrados en el JSON.";
        })
        .catch(error => {
            resultDataElement.textContent = "Error al obtener los datos del JSON.", error;
            console.error(error);
        });

    document.getElementById('searchQuery').value = '';
}



function showDetails(nut) {
    fetch(`/buscar?searchType=nut&searchQuery=${encodeURIComponent(nut)}`)
      .then(res => res.json())
      .then(data => {
        const persona = data[0];
  
        const html = `
        <div>
            <h3>🧍 Datos Personales</h3>
            <p><strong>Cédula:</strong> ${persona.socio_demografico.nut}</p>
            <p><strong>Nombre:</strong> ${persona.socio_demografico.nombre}</p>
            <p><strong>Sexo:</strong> ${persona.socio_demografico.sexo}</p>
            <p><strong>Fecha de Nacimiento:</strong> ${persona.socio_demografico.fecha_1}</p>
            <p><strong>Nacionalidad:</strong> ${persona.socio_demografico.nacionalidad}</p>
            <p><strong>Estado civil:</strong> ${persona.socio_demografico.civil}</p>
            <p><strong>Fecha 2:</strong> ${persona.socio_demografico.fecha_2}</p>
            <p><strong>Fecha 3:</strong> ${persona.socio_demografico.fecha_3}</p>
            <p><strong>Profesión:</strong> ${persona.socio_demografico.profesion}</p>

            <h3>👨‍👩‍👧‍👦 Cargas Familiares</h3>
            <p><strong>Cargas:</strong> ${persona.cantidad_cargas.cargas}</p>
            
            <h3>💼 Relación de Dependencia</h3>
            <p><strong>RUC:</strong> ${persona.datos_en_relacion_dependencia.ruc1}</p>
            <p><strong>Empresa:</strong> ${persona.datos_en_relacion_dependencia.nombre1}</p>
            <p><strong>Dirección:</strong> ${persona.datos_en_relacion_dependencia.direccion1}</p>
            <p><strong>Teléfono:</strong> ${persona.datos_en_relacion_dependencia.telefono1}</p>
            <p><strong>Descripción:</strong> ${persona.datos_en_relacion_dependencia.descripcion1}</p>
            <p><strong>Actividad:</strong> ${persona.datos_en_relacion_dependencia.actividad1}</p>
            <p><strong>Provincia:</strong> ${persona.datos_en_relacion_dependencia.provincia1}</p>
            <p><strong>Canton:</strong> ${persona.datos_en_relacion_dependencia.canton1}</p>
            <p><strong>Parroquia:</strong> ${persona.datos_en_relacion_dependencia.parroquia1}</p>
            <p><strong>Rango 1:</strong> ${persona.datos_en_relacion_dependencia.rango1}</p>
            <p><strong>Rango 2:</strong> ${persona.datos_en_relacion_dependencia.rango2}</p>
            <p><strong>Rango 3:</strong> ${persona.datos_en_relacion_dependencia.rango3}</p>
            <p><strong>Rango 4:</strong> ${persona.datos_en_relacion_dependencia.rango4}</p>
            <p><strong>Fecha 4:</strong> ${persona.datos_en_relacion_dependencia.fecha_4}</p>
            <p><strong>Fecha 5:</strong> ${persona.datos_en_relacion_dependencia.fecha_5}</p>
            <p><strong>Ocupación:</strong> ${persona.datos_en_relacion_dependencia.ocupacion}</p>
            
            <h3>🏢 Relacion de Independencia</h3>
            <p><strong>RUC:</strong> ${persona.datos_relacion_independencia.RUC}</p>
            <p><strong>Razon :</strong> ${persona.datos_relacion_independencia.RAZON}</p>
            <p><strong>Fantasia:</strong> ${persona.datos_relacion_independencia.FANTASIA}</p>
            <p><strong>Inicio:</strong> ${persona.datos_relacion_independencia.INICIO}</p>
            <p><strong>Cancelacion:</strong> ${persona.datos_relacion_independencia.CANCELACION}</p>
            <p><strong>Suspension:</strong> ${persona.datos_relacion_independencia.SUSPENSION}</p>
            <p><strong>Reinicio:</strong> ${persona.datos_relacion_independencia.REINICIO}</p>
            <p><strong>Direccion:</strong> ${persona.datos_relacion_independencia.DIRECCION_RUC}</p>
            <p><strong>Telefono:</strong> ${persona.datos_relacion_independencia.TELEFONORUC}</p>
            <p><strong>Referencia:</strong> ${persona.datos_relacion_independencia.REFERENCIA}</p>
            <p><strong>Actividad:</strong> ${persona.datos_relacion_independencia.ACTIVIDAD_RUC}</p>
            <p><strong>Provincia:</strong> ${persona.datos_relacion_independencia.PROVINCIA_RUC}</p>
            <p><strong>Canton:</strong> ${persona.datos_relacion_independencia.CANTON_RUC}</p>
            <p><strong>Parroquia:</strong> ${persona.datos_relacion_independencia.PARROQUIA_RUC}</p>

        </div>
           
        <div>
            <h3>📞 Contacto</h3>
            <p><strong>Celular:</strong> ${persona.medioscontacto.medio1}</p>
            <p><strong>Celular 2:</strong> ${persona.medioscontacto.medio2}</p>
            <p><strong>Celular 3:</strong> ${persona.medioscontacto.medio3}</p>
            <p><strong>Celular 4:</strong> ${persona.medioscontacto.medio4}</p>
            <p><strong>Celular 5:</strong> ${persona.medioscontacto.medio5}</p>
            <p><strong>Celular 6:</strong> ${persona.medioscontacto.medio6}</p>
            <p><strong>Dirección:</strong> ${persona.medioscontacto.DIRECCION_ADICIONAL}</p>
            <p><strong>Teléfono:</strong> ${persona.medioscontacto.TELEFONO_ADICIONAL}</p>
            <p><strong>Provincia:</strong> ${persona.medioscontacto.PROVINCIA_ADICIONAL}</p>
            <p><strong>Canton:</strong> ${persona.medioscontacto.CANTON_ADICIONAL}</p>
            <p><strong>Parroquia:</strong> ${persona.medioscontacto.PARROQUIA_ADICIONAL}</p>
            <p><strong>Email:</strong> ${persona.medioscontacto.EMAIL1}</p>
            <p><strong>Email 2:</strong> ${persona.medioscontacto.EMAIL2}</p>
            
            <h3>🏢 Empleador 1</h3>
            <p><strong>RUC:</strong> ${persona.empleador_1.empleador1ruc1}</p>
            <p><strong>Nombre:</strong> ${persona.empleador_1.empleador1nombre1}</p>
            <p><strong>Dirección:</strong> ${persona.empleador_1.empleador1direccion1}</p>
            <p><strong>Teléfono:</strong> ${persona.empleador_1.empleador1telefono1}</p>
            <p><strong>Descripción:</strong> ${persona.empleador_1.empleador1descripcion1}</p>
            <p><strong>Actividad:</strong> ${persona.empleador_1.empleador1actividad1}</p>
            <p><strong>Cargo:</strong> ${persona.empleador_1.empleador1cargo1}</p>
            <p><strong>Salario:</strong> ${persona.empleador_1.empleador1salario1}</p>
            <p><strong>Ingreso:</strong> ${persona.empleador_1.empleador1ingreso1}</p>
            <p><strong>Salida:</strong> ${persona.empleador_1.empleador1salida1}</p>
            <p><strong>Provincia:</strong> ${persona.empleador_1.empleador1provincia1}</p>
            <p><strong>Canton:</strong> ${persona.empleador_1.empleador1canton1}</p>
            <p><strong>Parroquia:</strong> ${persona.empleador_1.empleador1parroquia1}</p>

            <h3>🏢 Empleador 2</h3>
            <p><strong>RUC:</strong> ${persona.empleador_2.empleador2ruc2}</p>
            <p><strong>Nombre:</strong> ${persona.empleador_2.empleador2nombre2}</p>
            <p><strong>Dirección:</strong> ${persona.empleador_2.empleador2direccion2}</p>
            <p><strong>Teléfono:</strong> ${persona.empleador_2.empleador2telefono2}</p>
            <p><strong>Descripción:</strong> ${persona.empleador_2.empleador2descripcion2}</p>
            <p><strong>Actividad:</strong> ${persona.empleador_2.empleador2actividad2}</p>
            <p><strong>Cargo:</strong> ${persona.empleador_2.empleador2cargo2}</p>
            <p><strong>Salario:</strong> ${persona.empleador_2.empleador2salario2}</p>
            <p><strong>Ingreso:</strong> ${persona.empleador_2.empleador2ingreso2}</p>
            <p><strong>Salida:</strong> ${persona.empleador_2.empleador2salida2}</p>
            <p><strong>Provincia:</strong> ${persona.empleador_2.empleador2provincia2}</p>
            <p><strong>Canton:</strong> ${persona.empleador_2.empleador2canton2}</p>
            <p><strong>Parroquia:</strong> ${persona.empleador_2.empleador2parroquia2}</p>

            <h3>👨‍👩‍👧‍👦 Medios 1</h3>
            <p><strong>Dirección:</strong> ${persona.medios.direccion_medio}</p>
            <p><strong>Teléfono:</strong> ${persona.medios.telefono_medio}</p>
            <p><strong>Celular:</strong> ${persona.medios.celular_medio}</p>
            <p><strong>Email:</strong> ${persona.medios.email_medio}</p>
            <p><strong>Provincia:</strong> ${persona.medios.provincia_medio}</p>
            <p><strong>Cantón:</strong> ${persona.medios.canton_medio}</p>
            <p><strong>Parroquia:</strong> ${persona.medios.parroquia_medio}</p>

            <h3>👨‍👩‍👧‍👦 Medios 2</h3>
            <p><strong>Dirección:</strong> ${persona.medios_2.direccion_medio}</p>
            <p><strong>Teléfono:</strong> ${persona.medios_2.telefono_medio}</p>
            <p><strong>Celular:</strong> ${persona.medios_2.celular_medio}</p>
            <p><strong>Email:</strong> ${persona.medios_2.email_medio}</p>
            <p><strong>Provincia:</strong> ${persona.medios_2.provincia_medio}</p>
            <p><strong>Cantón:</strong> ${persona.medios_2.canton_medio}</p>
            <p><strong>Parroquia:</strong> ${persona.medios_2.parroquia_medio}</p>

        </div> 
        `;
          
          
  
        document.getElementById('detailContent').innerHTML = html;
        document.getElementById('detailBox').classList.remove('hidden');
      })
      .catch(err => {
        console.error(err);
      });
  }
  



// Evento para ejecutar searchData() cuando se presiona Enter en los campos de texto
document.getElementById('searchQuery').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchData();
    }
});

